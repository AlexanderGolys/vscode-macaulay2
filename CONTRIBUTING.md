# Contributing

Thank you for improving Macaulay2 support in Visual Studio Code.

## Development setup

Install Node.js 20 or newer, npm, Rust, and Cargo. Then prepare the extension:

```bash
npm install
npm run compile
```

Press `F5` in VS Code to launch an Extension Development Host. During development, the extension uses a bundled `m2-ls`, the path configured by `macaulay2.server.path`, or `m2-ls` from `PATH`.

## Bundling the server

```bash
npm run bundle:server
```

`bundle:server` downloads the `m2-ls` release pinned in `serverBundle.serverVersion` of `package.json` from crates.io and builds it for every target in `serverBundle.targets`, placing each executable under `bin/<platform>-<arch>/`. It cross-compiles with `cargo-zigbuild`, so every target builds from a single Linux or macOS host; the Linux builds link against glibc 2.28 so they run on distributions back to Debian 10 and Ubuntu 20.04. Zig and `cargo-zigbuild` are fetched into `.toolchain/` on first use at the versions pinned in `serverBundle`; Cargo and rustup are the only prerequisites.

It also runs `npm run sync:settings`, which takes the diagnostic rule choices offered by `macaulay2.diagnostics.disabled` from the bundled server release.

## Testing and packaging

- `npm test` runs integration checks in a private VS Code instance downloaded into `.vscode-test/`.
- `npm run try` opens that instance with the extension loaded, for trying it by hand.
- `npm run check` runs a strict TypeScript check.
- `npm run package:vsix` bundles the servers and creates one VSIX per target, each containing only the server for its platform.

Set `macaulay2.trace.server` to inspect LSP traffic when diagnosing protocol integration.

## Making changes

Keep the TypeScript wrapper focused on translating LSP capabilities into VS Code. Macaulay2 parsing and semantic behavior belong in `m2-ls`; grammar and syntax classification belong in `tree-sitter-macaulay2`.

Before submitting a pull request, run:

```bash
npm run check
npm run compile
git diff --check
```

Test affected editor behavior in an Extension Development Host. Pull requests should describe the user-visible change, list validation performed, and link related issues. Include screenshots when highlighting or other visible UI changes are affected.

Use concise, imperative commit subjects such as `Add server path configuration`.
