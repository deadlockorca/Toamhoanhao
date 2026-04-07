const fs = require("node:fs");
const path = require("node:path");

if (!process.env.HOSTNAME) process.env.HOSTNAME = "0.0.0.0";
if (!process.env.NEXT_DISABLE_SWC_WASM) process.env.NEXT_DISABLE_SWC_WASM = "1";
if (!process.env.PRISMA_CLIENT_ENGINE_TYPE) process.env.PRISMA_CLIENT_ENGINE_TYPE = "library";

const candidate = path.join(__dirname, ".next", "standalone", "server.js");

if (!fs.existsSync(candidate)) {
  console.error("[standalone.server] Missing runtime:", candidate);
  console.error("[standalone.server] Ensure deployment includes .next/standalone from next build output.");
  process.exit(1);
}

require(candidate);
