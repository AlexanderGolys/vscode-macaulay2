import { spawn } from "node:child_process";
import * as path from "node:path";

import { downloadAndUnzipVSCode } from "@vscode/test-electron";

import { repository, requireBundledServer, sampleWorkspace, vscodeVersion } from "./environment";

// Opens the private VS Code from `.vscode-test/` with the extension loaded
// from this repository, for trying it by hand. It stays open until closed.

async function main(): Promise<void> {
  requireBundledServer();
  const executable = await downloadAndUnzipVSCode(vscodeVersion);
  const editor = spawn(
    executable,
    [
      `--extensionDevelopmentPath=${repository}`,
      `--user-data-dir=${path.join(repository, ".vscode-test", "user-data-try")}`,
      `--extensions-dir=${path.join(repository, ".vscode-test", "extensions-try")}`,
      "--disable-workspace-trust",
      process.argv[2] ?? sampleWorkspace,
    ],
    { stdio: "ignore", detached: true },
  );
  editor.unref();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
