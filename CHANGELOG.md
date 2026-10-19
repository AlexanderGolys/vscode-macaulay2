# Changelog

All notable changes to this extension will be documented here.

## 1.0.6

- Rename the extension to Macaulay2 Language Server (m2-ls).

## 1.0.5

- Publish under the extension ID `AlexanderGolys.macaulay2-language-server`.

## 1.0.4

- Use the Macaulay2 logo as the extension icon.

## 1.0.3

- Add an extension icon.

## 1.0.2

- Rename the extension to Macaulay2 Language Server.

## 1.0.1

- Bundle `m2-ls` 1.2.0 for macOS and Windows on x64 and arm64.

## 1.0.0

- Add Macaulay2 language registration and editor configuration.
- Connect VS Code to `m2-ls` through the standard language client.
- Request combined Tree-sitter syntax and semantic tokens from the server.
- Add crates.io-based server bundling and VSIX packaging.
- Bundle `m2-ls` 1.2.0 for Linux x64 and arm64, built against glibc 2.28.
- Expose the server's diagnostics, formatting, and inlay hint settings, with the diagnostic rule choices taken from the bundled server.
- Enable semantic highlighting for Macaulay2 files with every color theme.
- Hide inlay hints by default in Macaulay2 files.
- Add integration tests against a downloaded VS Code.
