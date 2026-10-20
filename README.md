# Macaulay2 LSP

[![VS Marketplace](https://vsmarketplacebadges.dev/version-short/AlexanderGolys.macaulay2-language-server.svg)](https://marketplace.visualstudio.com/items?itemName=AlexanderGolys.macaulay2-language-server)
[![Installs](https://vsmarketplacebadges.dev/installs-short/AlexanderGolys.macaulay2-language-server.svg)](https://marketplace.visualstudio.com/items?itemName=AlexanderGolys.macaulay2-language-server)
[![GitHub release](https://img.shields.io/github/v/release/AlexanderGolys/vscode-macaulay2)](https://github.com/AlexanderGolys/vscode-macaulay2/releases/latest)
[![m2-ls](https://img.shields.io/crates/v/m2-ls?label=m2-ls)](https://crates.io/crates/m2-ls)
[![License](https://img.shields.io/github/license/AlexanderGolys/vscode-macaulay2)](LICENSE)

Language support for [Macaulay2](https://macaulay2.com) in Visual Studio Code, powered by the
[`m2-ls`](https://github.com/AlexanderGolys/m2-ls) language server. The server ships inside the
extension, so `.m2` files work out of the box with nothing else to install.

## Features

- **Highlighting** that understands Macaulay2 syntax, from a Tree-sitter grammar refined by
  semantic analysis. It works with every color theme.
- **Navigation:** go to definition, find references, document highlights, and document and
  workspace symbols.
- **Hover documentation** for the symbol under the cursor.
- **Completion**, including Macaulay2's builtin names.
- **Rename** a binding across its uses.
- **Diagnostics** with quick fixes, each rule individually silenceable.
- **Formatting** with configurable indentation, line widths, and layout.
- **Inlay hints** showing inferred types, off until you ask for them.
- **Folding** and bracket matching, with `--` line comments and `-* … *-` block comments.

## Installation

Install **Macaulay2 LSP** from the
[Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=AlexanderGolys.macaulay2-language-server),
or run:

```bash
code --install-extension AlexanderGolys.macaulay2-language-server
```

To install offline, download the VSIX for your platform from the
[latest release](https://github.com/AlexanderGolys/vscode-macaulay2/releases/latest) and run
`code --install-extension <file>.vsix`.

| Platform | x64 | arm64 |
| -------- | :-: | :---: |
| Linux (glibc 2.28+, e.g. Debian 10, Ubuntu 20.04) | ✓ | ✓ |
| macOS | ✓ | ✓ |
| Windows | ✓ | ✓ |

## Settings

All settings live under `macaulay2.*` and take effect without restarting.

| Setting | Default | Description |
| ------- | ------- | ----------- |
| `macaulay2.diagnostics.enabled` | `true` | Report diagnostics at all. |
| `macaulay2.diagnostics.disabled` | `[]` | Rules to hide, by name (`unused-binding`) or code (`S02`). |
| `macaulay2.formatting.indentWidth` | editor | Spaces per indentation level. |
| `macaulay2.formatting.useTabs` | editor | Indent with tabs. |
| `macaulay2.formatting.softLineWidth` | `100` | Width the formatter prefers to wrap at; `0` disables. |
| `macaulay2.formatting.hardLineWidth` | `100` | Width the formatter always wraps at; `0` disables. |
| `macaulay2.formatting.controlFlowLayout` | `multilineCompactElse` | Layout of `if`/`then`/`else` and loops. |
| `macaulay2.formatting.compactFactorOperators` | `false` | Write `2*x` instead of `2 * x`. |
| `macaulay2.formatting.breakAfterSemicolon` | `true` | Start the expression after `;` on a new line. |
| `macaulay2.inlayHints.expressionTypes` | `false` | Show types of arguments, subexpressions, and call results. |
| `macaulay2.inlayHints.allKnownTypes` | `false` | Also show types that are obvious from literals. |

Inlay hints are hidden by default in Macaulay2 files. Hold `Ctrl+Alt` to show them, or enable
them permanently:

```json
"[macaulay2]": {
  "editor.inlayHints.enabled": "on"
}
```

## Troubleshooting

- **Use a different server build:** set `macaulay2.server.path` to an `m2-ls` executable, and pass
  extra flags through `macaulay2.server.arguments`.
- **Inspect the protocol traffic:** set `macaulay2.trace.server` to `messages` or `verbose` and
  open the *Macaulay2 Language Server* output channel.
- **Report a problem:** open an issue on
  [GitHub](https://github.com/AlexanderGolys/vscode-macaulay2/issues) with the file that
  triggers it, if you can share it.

## Development

```bash
npm install
npm run bundle:server   # build m2-ls for every platform into bin/
npm run compile
npm test                # integration tests in a downloaded VS Code
```

Press `F5` to launch an Extension Development Host. See [CONTRIBUTING.md](CONTRIBUTING.md) for
the build toolchain, packaging, and where changes belong.

## License

The extension is available under the [MIT License](LICENSE). Packaged releases include `m2-ls`,
licensed under GPL-3.0-only; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
