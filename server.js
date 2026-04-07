const path = require("node:path");
const fs = require("node:fs");
const { spawn, spawnSync } = require("node:child_process");

if (!process.env.HOSTNAME) process.env.HOSTNAME = "0.0.0.0";
if (!process.env.NEXT_DISABLE_SWC_WASM) process.env.NEXT_DISABLE_SWC_WASM = "1";
if (!process.env.PRISMA_CLIENT_ENGINE_TYPE) process.env.PRISMA_CLIENT_ENGINE_TYPE = "library";

const relaunchWithDisabledCoreDumps = () => {
  if (process.platform !== "linux") return false;
  if (process.env.CORE_DUMP_LIMIT_APPLIED === "1") return false;

  const child = spawn(
    "/bin/sh",
    ["-c", 'ulimit -c 0; exec "$@"', "sh", process.execPath, ...process.argv.slice(1)],
    {
      stdio: "inherit",
      env: { ...process.env, CORE_DUMP_LIMIT_APPLIED: "1" },
    }
  );

  child.on("error", (error) => {
    console.error("[server] failed to relaunch with core dumps disabled:", error);
    process.exit(1);
  });

  const forwardSignal = (signal) => {
    if (!child.killed) child.kill(signal);
  };
  process.on("SIGINT", () => forwardSignal("SIGINT"));
  process.on("SIGTERM", () => forwardSignal("SIGTERM"));
  process.on("SIGHUP", () => forwardSignal("SIGHUP"));

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });

  return true;
};

const disableCoreDumpsForProcess = () => {
  if (process.platform !== "linux") return;
  const result = spawnSync("prlimit", ["--pid", String(process.pid), "--core=0:0"], {
    stdio: "ignore",
  });
  if (typeof result.status === "number" && result.status === 0) return;
};

const cleanupCoreFiles = () => {
  const appRoot = process.cwd();
  let entries = [];
  try {
    entries = fs.readdirSync(appRoot, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!/^core(?:\..+)?$/.test(entry.name)) continue;
    try {
      fs.unlinkSync(path.join(appRoot, entry.name));
    } catch {}
  }
};

const resolveRuntimeEntry = () => {
  const candidates = [
    path.join(process.cwd(), ".next", "standalone", "server.js"),
    path.join(__dirname, "standalone.server.js"),
  ];
  for (const entry of candidates) {
    if (fs.existsSync(entry)) return entry;
  }
  return "";
};

if (!relaunchWithDisabledCoreDumps()) {
  disableCoreDumpsForProcess();
  cleanupCoreFiles();

  const entry = resolveRuntimeEntry();
  if (!entry) {
    console.error("[server] Missing standalone runtime entry (.next/standalone/server.js or standalone.server.js)");
    process.exit(1);
  }

  Promise.resolve()
    .then(() => require(entry))
    .catch((err) => {
    console.error("[server] startup error:", err);
    process.exit(1);
    });
}
