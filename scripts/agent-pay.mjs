/**
 * Autonomous payer: GET x402 resource → Umbra SDK settle → POST confirm.
 * Mirrors the browser checkout (`PayWithUmbra`): same `getUmbraClient`, registration
 * helpers, `getPublicBalanceToReceiverClaimableUtxoCreatorFunction`, and
 * `getCreateReceiverClaimableUtxoFromPublicBalanceProver` — signer is Node keypair bytes.
 *
 * Usage:
 *   INTENT_ID=<uuid> AGENT_KEYPAIR=./agent-keypair.json APP_URL=http://localhost:3000 node scripts/agent-pay.mjs
 *
 * `agent-keypair.json` is a Solana keypair JSON array (same as solana-keygen).
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const intentId = process.env.INTENT_ID ?? process.argv[2];
const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

if (!intentId) {
  console.error("Missing INTENT_ID env or first CLI arg (payment intent UUID).");
  process.exit(1);
}

const resourceUrl = `${appUrl}/api/resources/${intentId}`;

const {
  createSignerFromPrivateKeyBytes,
  getPublicBalanceToReceiverClaimableUtxoCreatorFunction,
  getUmbraClient,
  getUserRegistrationFunction,
  getUserAccountQuerierFunction,
} = await import("@umbra-privacy/sdk");
const { assertU64 } = await import("@umbra-privacy/sdk/types");
const { address } = await import("@solana/kit");
const { getCreateReceiverClaimableUtxoFromPublicBalanceProver } = await import(
  "@umbra-privacy/web-zk-prover"
);

function networkFromEnv() {
  const n = (process.env.UMBRA_NETWORK ?? "mainnet").toLowerCase();
  if (n === "devnet" || n === "localnet") return n;
  return "mainnet";
}

function rpcFor(network) {
  return (
    process.env.SOLANA_RPC_URL ??
    (network === "devnet"
      ? "https://api.devnet.solana.com"
      : "https://api.mainnet-beta.solana.com")
  );
}

function wsFor(network) {
  return (
    process.env.SOLANA_WS_URL ??
    (network === "devnet"
      ? "wss://api.devnet.solana.com"
      : "wss://api.mainnet-beta.solana.com")
  );
}

const res = await fetch(resourceUrl);
const body = await res.json();

if (res.status === 200 && body.unlocked) {
  console.log("Resource already unlocked:", body);
  process.exit(0);
}

if (res.status !== 402) {
  console.error("Expected 402, got", res.status, body);
  process.exit(1);
}

const accept = body.accepts?.[0];
const extra = accept?.extra;
if (!accept || extra?.settlement !== "umbra-receiver-claimable-utxo") {
  console.error("Unexpected 402 body:", JSON.stringify(body, null, 2));
  process.exit(1);
}

const keypairPath = process.env.AGENT_KEYPAIR;
if (!keypairPath) {
  console.error(
    "Set AGENT_KEYPAIR to a solana-keygen JSON path (payer needs SOL + USDC for the chosen cluster).",
  );
  process.exit(1);
}

const raw = JSON.parse(await readFile(resolve(keypairPath), "utf8"));
const secret = new Uint8Array(raw);
const signer = await createSignerFromPrivateKeyBytes(secret);

const network = networkFromEnv();
const client = await getUmbraClient({
  signer,
  network,
  rpcUrl: rpcFor(network),
  rpcSubscriptionsUrl: wsFor(network),
  indexerApiEndpoint:
    process.env.UMBRA_INDEXER_URL ?? "https://utxo-indexer.api.umbraprivacy.com",
  deferMasterSeedSignature: true,
});

const fetchUser = getUserAccountQuerierFunction({ client });
const regStatus = await fetchUser(signer.address);
if (regStatus.state === "non_existent") {
  console.log("Registering Umbra identity for agent wallet…");
  const register = getUserRegistrationFunction({ client });
  await register({ confidential: true, anonymous: true });
}

const zkProver = getCreateReceiverClaimableUtxoFromPublicBalanceProver();
const createUtxo = getPublicBalanceToReceiverClaimableUtxoCreatorFunction(
  { client },
  { zkProver },
);

const rawAmount = BigInt(extra.amountAtomic);
assertU64(rawAmount);
console.log(
  `Creating Umbra receiver-claimable UTXO → merchant ${extra.merchantAddress} amount ${rawAmount} mint ${extra.mint}…`,
);

const utxoResult = await createUtxo({
  destinationAddress: address(extra.merchantAddress),
  mint: address(extra.mint),
  amount: rawAmount,
});

const signatures = [
  utxoResult.createProofAccountSignature,
  utxoResult.createUtxoSignature,
  ...(utxoResult.closeProofAccountSignature
    ? [utxoResult.closeProofAccountSignature]
    : []),
];

const confirmUrl = `${appUrl}/api/intents/${intentId}/confirm`;
const confirmRes = await fetch(confirmUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ signatures }),
});
const confirmJson = await confirmRes.json();
if (!confirmRes.ok) {
  console.error("Confirm failed:", confirmJson);
  process.exit(1);
}

console.log("Done. Umbra signatures:", signatures);
console.log("Confirm:", confirmJson);

const again = await fetch(resourceUrl);
console.log("Re-fetch resource:", again.status, await again.json());
