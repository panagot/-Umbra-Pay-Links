import { getRpcUrl } from "@/lib/umbra-config";

type RpcSigStatus = {
  confirmationStatus?: string | null;
  err?: unknown;
};

type RpcResponse = {
  result?: { value: (RpcSigStatus | null)[] };
  error?: { message?: string };
};

/**
 * Confirms each base58 transaction signature reached `confirmed` or `finalized`
 * on the configured Solana JSON-RPC (see `NEXT_PUBLIC_SOLANA_RPC_URL`).
 */
export async function verifySettlementSignaturesOnChain(
  signatures: string[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (signatures.length === 0) {
    return { ok: false, error: "No signatures to verify" };
  }
  const rpcUrl = getRpcUrl();
  const body = {
    jsonrpc: "2.0" as const,
    id: 1,
    method: "getSignatureStatuses",
    params: [signatures, { searchTransactionHistory: true }],
  };
  let json: RpcResponse;
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    json = (await res.json()) as RpcResponse;
  } catch (e) {
    return {
      ok: false,
      error: `RPC request failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  if (json.error?.message) {
    return { ok: false, error: json.error.message };
  }
  const value = json.result?.value;
  if (!Array.isArray(value) || value.length !== signatures.length) {
    return { ok: false, error: "Unexpected RPC response for getSignatureStatuses" };
  }
  for (let i = 0; i < value.length; i++) {
    const st = value[i];
    if (!st) {
      return {
        ok: false,
        error: `Signature ${signatures[i]?.slice(0, 8)}… not found or not landed yet`,
      };
    }
    if (st.err != null) {
      return {
        ok: false,
        error: `Transaction ${signatures[i]?.slice(0, 8)}… failed on-chain`,
      };
    }
    const cs = st.confirmationStatus;
    if (cs !== "confirmed" && cs !== "finalized") {
      return {
        ok: false,
        error: `Signature ${signatures[i]?.slice(0, 8)}… not confirmed (status: ${cs ?? "none"})`,
      };
    }
  }
  return { ok: true };
}

export function requireOnchainConfirmForSettle(): boolean {
  return process.env.REQUIRE_ONCHAIN_CONFIRM_FOR_SETTLE === "1" ||
    process.env.REQUIRE_ONCHAIN_CONFIRM_FOR_SETTLE === "true";
}
