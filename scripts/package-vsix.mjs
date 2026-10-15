import { spawnSync } from "node:child_process";
import { arch, platform } from "node:process";
import { resolve } from "node:path";

// Packages a VSIX restricted to the platform whose server `bundle:server`
// placed under `bin/<platform>-<arch>/`; VS Code names its targets the same way.

const repository = resolve(import.meta.dirname, "..");
const target = `${platform}-${arch}`;

const result = spawnSync(
  "npx",
  ["vsce", "package", "--no-dependencies", "--target", target],
  { cwd: repository, stdio: "inherit" },
);
if (result.error !== undefined) {
  throw result.error;
}
process.exit(result.status ?? 1);
