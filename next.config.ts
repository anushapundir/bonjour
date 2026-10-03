import type { NextConfig } from "next";

export default {
  agentRules: false,
  // Pages and the run API read data/ and results/ from disk at runtime.
  outputFileTracingIncludes: { "/**": ["./data/**/*", "./results/**/*"] },
} satisfies NextConfig;
