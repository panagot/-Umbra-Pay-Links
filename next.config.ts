import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@umbra-privacy/sdk", "@umbra-privacy/web-zk-prover"],
};

export default nextConfig;
