import * as assert from "node:assert/strict";

import * as vscode from "vscode";

// Integration checks run inside the VS Code instance started by `runTests`.
// Each check exercises one server feature through the editor's own commands,
// the same path a user's request takes.

const extensionId = "alexandergolys.vscode-macaulay2";
const sampleFile = "sample.m2";
const serverResponseTimeout = 30_000;

type Check = (document: vscode.TextDocument) => Promise<void>;

const checks: Record<string, Check> = {
  async "reports a diagnostic with its code"(document) {
    await diagnosticsWithCode(document, "S03");
  },

  async "offers a quick fix for that diagnostic"(document) {
    const [diagnostic] = await diagnosticsWithCode(document, "S03");
    const actions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
      "vscode.executeCodeActionProvider",
      document.uri,
      diagnostic!.range,
    );
    assert.ok(actions.length > 0, "no code action for S03");
  },

  async "hides a diagnostic disabled in settings"(document) {
    await diagnosticsWithCode(document, "S03");
    const settings = vscode.workspace.getConfiguration("macaulay2");
    await settings.update("diagnostics.disabled", ["S03"], vscode.ConfigurationTarget.Global);
    try {
      await waitFor("S03 to disappear", () =>
        vscode.languages
          .getDiagnostics(document.uri)
          .every((diagnostic) => diagnosticCode(diagnostic) !== "S03"),
      );
    } finally {
      await settings.update("diagnostics.disabled", undefined, vscode.ConfigurationTarget.Global);
    }
  },

  async "shows documentation on hover"(document) {
    const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
      "vscode.executeHoverProvider",
      document.uri,
      positionOf(document, "ideal"),
    );
    const text = hovers.flatMap((hover) => hover.contents.map(markdownText)).join("\n");
    assert.match(text, /ideal/);
  },

  // m2-ls offers builtins once the typed prefix narrows them to a few names;
  // `satur` matches only `saturate` and `saturateEdges`.
  async "completes builtin names"(document) {
    const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
      "vscode.executeCompletionItemProvider",
      document.uri,
      positionOf(document, "saturate", "satur".length),
    );
    const labels = completions.items.map((item) =>
      typeof item.label === "string" ? item.label : item.label.label,
    );
    assert.ok(
      labels.includes("saturate"),
      `saturate is not among the ${labels.length} completions: ${labels.slice(0, 15).join(", ")}`,
    );
  },

  async "goes to a definition"(document) {
    const locations = await vscode.commands.executeCommand<(vscode.Location | vscode.LocationLink)[]>(
      "vscode.executeDefinitionProvider",
      document.uri,
      positionOf(document, "increment 3"),
    );
    const definitionLine = positionOf(document, "increment = ").line;
    assert.ok(
      locations.some((location) => targetRange(location).start.line === definitionLine),
      "definition of increment not found",
    );
  },

  async "finds references"(document) {
    const references = await vscode.commands.executeCommand<vscode.Location[]>(
      "vscode.executeReferenceProvider",
      document.uri,
      positionOf(document, "increment = "),
    );
    assert.ok(references.length >= 2, `expected 2 references, got ${references.length}`);
  },

  async "renames a binding"(document) {
    const edit = await vscode.commands.executeCommand<vscode.WorkspaceEdit>(
      "vscode.executeDocumentRenameProvider",
      document.uri,
      positionOf(document, "increment = "),
      "step",
    );
    assert.ok(edit.get(document.uri).length >= 2, "rename does not touch every use");
  },

  async "lists document symbols"(document) {
    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      "vscode.executeDocumentSymbolProvider",
      document.uri,
    );
    const names = symbols.map((symbol) => symbol.name);
    for (const expected of ["R", "I", "J", "increment", "next", "sign", "total"]) {
      assert.ok(names.includes(expected), `${expected} is missing from the outline`);
    }
  },

  async "formats the document"(document) {
    const edits = await vscode.commands.executeCommand<vscode.TextEdit[]>(
      "vscode.executeFormatDocumentProvider",
      document.uri,
      { tabSize: 4, insertSpaces: true },
    );
    assert.ok(edits.length > 0, "formatter left `total=1+2` unchanged");
  },

  async "provides semantic highlighting"(document) {
    const tokens = await vscode.commands.executeCommand<vscode.SemanticTokens>(
      "vscode.provideDocumentSemanticTokens",
      document.uri,
    );
    assert.ok(tokens.data.length > 0, "no semantic tokens");
  },

  async "provides folding ranges"(document) {
    const ranges = await vscode.commands.executeCommand<vscode.FoldingRange[]>(
      "vscode.executeFoldingRangeProvider",
      document.uri,
    );
    assert.ok(Array.isArray(ranges), "no folding range response");
  },
};

export async function run(): Promise<void> {
  const extension = vscode.extensions.getExtension(extensionId);
  assert.ok(extension, `${extensionId} is not installed in the test instance`);

  const [sample] = await vscode.workspace.findFiles(sampleFile);
  assert.ok(sample, `${sampleFile} is missing from the test workspace`);
  const document = await vscode.workspace.openTextDocument(sample);
  await vscode.window.showTextDocument(document);
  await extension.activate();

  const failures: string[] = [];
  for (const [name, check] of Object.entries(checks)) {
    try {
      await check(document);
      console.log(`  ✓ ${name}`);
    } catch (error) {
      failures.push(name);
      console.log(`  ✗ ${name}\n      ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log(`${Object.keys(checks).length - failures.length}/${Object.keys(checks).length} checks passed`);
  if (failures.length > 0) {
    throw new Error(`failed: ${failures.join(", ")}`);
  }
}

async function diagnosticsWithCode(
  document: vscode.TextDocument,
  code: string,
): Promise<vscode.Diagnostic[]> {
  let matching: vscode.Diagnostic[] = [];
  await waitFor(`a ${code} diagnostic`, () => {
    matching = vscode.languages
      .getDiagnostics(document.uri)
      .filter((diagnostic) => diagnosticCode(diagnostic) === code);
    return matching.length > 0;
  });
  return matching;
}

async function waitFor(description: string, condition: () => boolean): Promise<void> {
  const deadline = Date.now() + serverResponseTimeout;
  while (!condition()) {
    if (Date.now() > deadline) {
      throw new Error(`timed out waiting for ${description}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

function positionOf(document: vscode.TextDocument, text: string, offset = 0): vscode.Position {
  const index = document.getText().indexOf(text);
  assert.ok(index >= 0, `${JSON.stringify(text)} is not in ${sampleFile}`);
  return document.positionAt(index + offset);
}

function diagnosticCode(diagnostic: vscode.Diagnostic): string | undefined {
  const code = diagnostic.code;
  if (code === undefined) {
    return undefined;
  }
  return String(typeof code === "object" ? code.value : code);
}

function markdownText(content: vscode.MarkdownString | vscode.MarkedString): string {
  if (typeof content === "string") {
    return content;
  }
  return "value" in content ? content.value : "";
}

function targetRange(location: vscode.Location | vscode.LocationLink): vscode.Range {
  return "targetRange" in location ? location.targetRange : location.range;
}
