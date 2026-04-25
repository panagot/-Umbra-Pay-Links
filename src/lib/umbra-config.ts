export type UmbraNetwork = "mainnet" | "devnet" | "localnet";

const DEFAULT_INDEXER = "https://utxo-indexer.api.umbraprivacy.com";

export function getPublicUmbraNetwork(): UmbraNetwork {
  const n = process.env.NEXT_PUBLIC_UMBRA_NETWORK?.toLowerCase();
  if (n === "devnet" || n === "localnet") return n;
  return "mainnet";
}

export function getRpcUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
    (getPublicUmbraNetwork() === "devnet"
      ? "https://api.devnet.solana.com"
      : "https://api.mainnet-beta.solana.com")
  );
}

export function getRpcSubscriptionsUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SOLANA_WS_URL ??
    (getPublicUmbraNetwork() === "devnet"
      ? "wss://api.devnet.solana.com"
      : "wss://api.mainnet-beta.solana.com")
  );
}

export function getIndexerUrl(): string {
  return process.env.NEXT_PUBLIC_UMBRA_INDEXER_URL ?? DEFAULT_INDEXER;
}

/** USDC mint for the selected cluster (override via env for custom tokens). */
export function getDefaultUsdcMint(): string {
  return (
    process.env.NEXT_PUBLIC_USDC_MINT ??
    (getPublicUmbraNetwork() === "devnet"
      ? "4zMMC9srt5Ri5X14GAgZXhaLwqD3bDogAYQSDwYp7nz7"
      : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
  );
}

export function getAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function x402SolanaNetwork(): "solana-mainnet" | "solana-devnet" {
  return getPublicUmbraNetwork() === "devnet"
    ? "solana-devnet"
    : "solana-mainnet";
}
