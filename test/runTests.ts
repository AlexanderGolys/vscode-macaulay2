import * as path from "node:path";

import { runTests } from "@vscode/test-electron";

import { repository, requireBundledServer, sampleWorkspace, vscodeVersion } from "./environment";

// Downloads a private VS Code into `.vscode-test/` and runs the integration
// suite against the extension and its bundled server.

async function main(): Promise<void> {
  requireBundledServer();
  await runTests({
    extensionDevelopmentPath: repository,
    extensionTestsPath: path.join(__dirname, "suite", "index.js"),
    version: vscodeVersion,
    launchArgs: [sampleWorkspace, "--disable-extensions", "--disable-workspace-trust"],
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
