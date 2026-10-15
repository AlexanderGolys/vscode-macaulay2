# Macaulay2 for VS Code

This extension exposes `m2-ls` in Visual Studio Code through the standard Language Server Protocol client. The client forwards the capabilities advertised by the server:

- definitions, references, renaming, hover, and document highlights;
- document and workspace symbols;
- completions, folding ranges, code actions, and diagnostics;
- formatting, semantic tokens, and inlay hints.

The server also owns the Tree-sitter-based syntax layer; the extension does not duplicate Macaulay2 analysis. Highlighting therefore comes entirely from semantic tokens, which the extension enables for Macaulay2 files regardless of the color theme.

## Settings

Server settings live under `macaulay2.*` in the Settings editor and apply without a restart:

- `macaulay2.diagnostics.enabled` and `macaulay2.diagnostics.disabled`, which hides individual rules by name or code;
- `macaulay2.formatting.*` for indentation, line widths, control-flow layout, and operator spacing;
- `macaulay2.inlayHints.*` for the kinds of type hints the server reports.

Inlay hints are hidden by default in Macaulay2 files; hold `Ctrl+Alt` to show them, or set `editor.inlayHints.enabled` to `on` for `[macaulay2]`.

## Development

```bash
npm install
npm run compile
npm run bundle:server
```

`bundle:server` installs `m2-ls` 1.2.0 from crates.io with Cargo and places the executable under `bin/<platform>-<arch>/`. That server release pins the published `tree-sitter-macaulay2` grammar. Press `F5` in VS Code to launch an Extension Development Host after compiling.

During development, if no bundled executable exists, the extension runs `m2-ls` from `PATH`. Set `macaulay2.server.path` to test a specific build and `macaulay2.server.arguments` for additional command-line arguments.

`bundle:server` also runs `npm run sync:settings`, which takes the diagnostic rule choices offered by `macaulay2.diagnostics.disabled` from the bundled server release.

`npm test` runs integration checks in a private VS Code instance downloaded into `.vscode-test/`; `npm run try` opens that instance with the extension loaded, for trying it by hand without installing VS Code.

Run `npm run check` for a strict TypeScript check. Use `macaulay2.trace.server` to inspect LSP traffic when diagnosing protocol integration.

Run `npm run package:vsix` to bundle the current platform's server and create an installable VSIX.

## License

The VS Code extension source is available under the MIT License. Packaged releases include `m2-ls`, which remains licensed under GPL-3.0-only. See `THIRD_PARTY_NOTICES.md` for dependency licensing details.
