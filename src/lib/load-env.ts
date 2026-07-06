// Server-only. Ensures variables defined in the project's .env file are
// available on process.env during local development. TanStack Start's dev
// server does not automatically load .env into the server runtime, which is
// why server functions (e.g. the Anthropic calls) couldn't see
// ANTHROPIC_API_KEY even though it was set in .env.
//
// On Vercel the .env file is absent and the platform provides the env vars,
// so the read simply no-ops. Existing process.env values are never overwritten.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

try {
  const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    if (process.env[key]) continue; // never override platform-provided vars
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
} catch {
  // No .env file present (e.g. production) — rely on platform env vars.
}
