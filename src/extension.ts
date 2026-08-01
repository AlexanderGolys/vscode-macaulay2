import * as fs from "node:fs";
import * as path from "node:path";

import * as vscode from "vscode";
import {
  InitializeParams,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";

let client: Macaulay2LanguageClient | undefined;

class Macaulay2LanguageClient extends LanguageClient {
  protected override fillInitializeParams(params: InitializeParams): void {
    super.fillInitializeParams(params);

    const semanticTokens = params.capabilities.textDocument?.semanticTokens;
    if (semanticTokens !== undefined) {
      // There is no separate TextMate grammar. Ask m2-ls for its
      // Tree-sitter syntax tokens as well as its semantic refinements.
      semanticTokens.augmentsSyntaxTokens = false;
    }
  }
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const configuration = vscode.workspace.getConfiguration("macaulay2");
  const command = resolveServerCommand(context, configuration.get("server.path", ""));
  const args = configuration.get<string[]>("server.arguments", []);

  const serverOptions: ServerOptions = {
    command,
    args,
  };
  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { language: "macaulay2", scheme: "file" },
      { language: "macaulay2", scheme: "untitled" },
    ],
    synchronize: {
      configurationSection: "macaulay2",
      fileEvents: vscode.workspace.createFileSystemWatcher("**/*.m2"),
    },
  };

  client = new Macaulay2LanguageClient(
    "macaulay2",
    "Macaulay2 Language Server",
    serverOptions,
    clientOptions,
  );
  context.subscriptions.push(client);
  await client.start();
}

export async function deactivate(): Promise<void> {
  const activeClient = client;
  client = undefined;
  if (activeClient !== undefined) {
    await activeClient.stop();
  }
}

function resolveServerCommand(
  context: vscode.ExtensionContext,
  configuredPath: string,
): string {
  const override = configuredPath.trim();
  if (override !== "") {
    return override;
  }

  const executable = process.platform === "win32" ? "m2-ls.exe" : "m2-ls";
  const bundled = path.join(
    context.extensionPath,
    "bin",
    `${process.platform}-${process.arch}`,
    executable,
  );
  return fs.existsSync(bundled) ? bundled : executable;
}
