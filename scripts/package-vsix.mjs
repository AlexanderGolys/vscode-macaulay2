import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { repository, run, serverExecutable, targets } from "./toolchain.mjs";

// Packages one VSIX per VS Code target in `serverBundle.targets`, each holding
// only the server built for that target.

const packagingDirectory = join(repository, ".toolchain", "packaging");
mkdirSync(packagingDirectory, { recursive: true });
const sharedIgnores = readFileSync(join(repository, ".vscodeignore"), "utf8");

for (const vscodeTarget of Object.keys(targets)) {
  const server = join(repository, "bin", vscodeTarget, serverExecutable(vscodeTarget));
  if (!existsSync(server)) {
    throw new Error(`${server} is missing; run \`npm run bundle:server\` first`);
  }
  const ignoreFile = join(packagingDirectory, `${vscodeTarget}.vscodeignore`);
  writeFileSync(ignoreFile, `${sharedIgnores}bin/**\n!bin/${vscodeTarget}/**\n`);
  run(
    "npx",
    ["vsce", "package", "--no-dependencies", "--target", vscodeTarget, "--ignoreFile", ignoreFile],
    { cwd: repository },
  );
}
