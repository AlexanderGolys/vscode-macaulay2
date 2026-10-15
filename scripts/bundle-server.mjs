import { chmodSync, copyFileSync, mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";

import {
  crossCompilationPath,
  repository,
  run,
  serverExecutable,
  serverSource,
  serverVersion,
  targets,
} from "./toolchain.mjs";

// Builds the pinned server release for every VS Code target in
// `serverBundle.targets` and places each executable under `bin/<target>/`.
// Zig links against an old glibc, so the Linux builds run on older systems
// than the one building them.

const source = await serverSource();
const path = await crossCompilationPath();

for (const [vscodeTarget, rustTarget] of Object.entries(targets)) {
  // A `.<glibc version>` suffix is for the linker only; rustup and the build
  // output use the plain target triple.
  const rustTriple = rustTarget.replace(/\.[\d.]+$/, "");
  run("rustup", ["target", "add", rustTriple]);
  run("cargo", ["zigbuild", "--release", "--locked", "--target", rustTarget], {
    cwd: source,
    env: { ...process.env, PATH: path },
  });

  const executable = serverExecutable(vscodeTarget);
  const destinationDirectory = join(repository, "bin", vscodeTarget);
  mkdirSync(destinationDirectory, { recursive: true });
  const destination = join(destinationDirectory, executable);
  // Replace by renaming, so a server still running from the previous bundle
  // keeps its executable instead of blocking the copy.
  const incoming = `${destination}.incoming`;
  copyFileSync(join(source, "target", rustTriple, "release", executable), incoming);
  chmodSync(incoming, 0o755);
  renameSync(incoming, destination);
  console.log(`bundled ${executable} ${serverVersion} for ${vscodeTarget}`);
}
