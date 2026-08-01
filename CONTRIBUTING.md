# Contributing

Thank you for improving Macaulay2 support in Visual Studio Code.

## Development setup

Install Node.js 20 or newer, npm, Rust, and Cargo. Then prepare the extension:

```bash
npm install
npm run compile
```

Press `F5` in VS Code to launch an Extension Development Host. During development, the extension uses a bundled `m2-ls`, the path configured by `macaulay2.server.path`, or `m2-ls` from `PATH`.

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
