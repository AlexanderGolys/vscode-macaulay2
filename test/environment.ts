import * as fs from "node:fs";
import * as path from "node:path";

// The VS Code build, extension, and workspace shared by the integration suite
// and the interactive editor.

export const repository = path.resolve(__dirname, "..", "..");

const manifest = JSON.parse(fs.readFileSync(path.join(repository, "package.json"), "utf8"));

/** The oldest VS Code the extension supports, from `engines.vscode`. */
export const vscodeVersion: string = manifest.engines.vscode.replace(/^\^/, "");

export const sampleWorkspace = path.join(repository, "test", "workspace");

/** Fails unless `bundle:server` has placed the server for this platform. */
export function requireBundledServer(): void {
  const executable = process.platform === "win32" ? "m2-ls.exe" : "m2-ls";
  const bundledServer = path.join(
    repository,
    "bin",
    `${process.platform}-${process.arch}`,
    executable,
  );
  if (!fs.existsSync(bundledServer)) {
    throw new Error(`${bundledServer} is missing; run \`npm run bundle:server\` first`);
  }
}
