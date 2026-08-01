import { chmodSync, copyFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { arch, platform } from "node:process";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";

const repository = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(join(repository, "package.json"), "utf8"));
const { serverCrate, serverVersion } = manifest.serverBundle;
const staging = mkdtempSync(join(tmpdir(), "vscode-macaulay2-server-"));
const executable = platform === "win32" ? `${serverCrate}.exe` : serverCrate;
const destinationDirectory = join(repository, "bin", `${platform}-${arch}`);

try {
  const result = spawnSync(
    "cargo",
    [
      "install",
      "--locked",
      "--root",
      staging,
      "--version",
      `=${serverVersion}`,
      serverCrate,
    ],
    { stdio: "inherit" },
  );
  if (result.error !== undefined) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`cargo install exited with status ${result.status}`);
  }

  mkdirSync(destinationDirectory, { recursive: true });
  const destination = join(destinationDirectory, executable);
  copyFileSync(join(staging, "bin", executable), destination);
  if (platform !== "win32") {
    chmodSync(destination, 0o755);
  }
} finally {
  rmSync(staging, { recursive: true, force: true });
}
