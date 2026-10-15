import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { arch, platform } from "node:process";
import { delimiter, join, resolve } from "node:path";

// The pinned tools and sources the server bundle is built from, fetched into
// `.toolchain/` on first use: the published server crate, Zig as the
// cross-linker, and cargo-zigbuild to drive it.

export const repository = resolve(import.meta.dirname, "..");
export const manifest = JSON.parse(readFileSync(join(repository, "package.json"), "utf8"));
export const { serverCrate, serverVersion, targets, zigVersion, cargoZigbuildVersion } =
  manifest.serverBundle;

const toolchain = join(repository, ".toolchain");
const crateRegistry = "https://crates.io/api/v1/crates";
const zigIndex = "https://ziglang.org/download/index.json";
// crates.io rejects requests without a user agent.
const userAgent = `${manifest.name} build scripts`;

/** The executable name of the server on the platform a VSIX targets. */
export function serverExecutable(vscodeTarget) {
  return vscodeTarget.startsWith("win32-") ? `${serverCrate}.exe` : serverCrate;
}

/** Runs a command to completion, failing on a non-zero exit. */
export function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.error !== undefined) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with status ${result.status}`);
  }
}

/** The unpacked source of the pinned server release. */
export async function serverSource() {
  const source = join(toolchain, "crates", `${serverCrate}-${serverVersion}`);
  if (!existsSync(join(source, "Cargo.lock"))) {
    const archive = join(toolchain, "crates", `${serverCrate}-${serverVersion}.crate`);
    await download(`${crateRegistry}/${serverCrate}/${serverVersion}/download`, archive);
    run("tar", ["-xzf", archive, "-C", join(toolchain, "crates")]);
    rmSync(archive);
  }
  return source;
}

/** A PATH that puts the pinned Zig and cargo-zigbuild first. */
export async function crossCompilationPath() {
  const zig = await zigDirectory();
  const zigbuild = join(toolchain, `cargo-zigbuild-${cargoZigbuildVersion}`);
  if (!existsSync(join(zigbuild, "bin"))) {
    run("cargo", [
      "install",
      "--locked",
      "--root",
      zigbuild,
      "--version",
      `=${cargoZigbuildVersion}`,
      "cargo-zigbuild",
    ]);
  }
  return [zig, join(zigbuild, "bin"), process.env.PATH].join(delimiter);
}

async function zigDirectory() {
  const host = `${{ x64: "x86_64", arm64: "aarch64" }[arch]}-${{ linux: "linux", darwin: "macos" }[platform]}`;
  const directory = join(toolchain, `zig-${host}-${zigVersion}`);
  if (existsSync(directory)) {
    return directory;
  }
  const release = (await (await fetch(zigIndex)).json())[zigVersion]?.[host];
  if (release === undefined) {
    throw new Error(`Zig ${zigVersion} has no build for ${host}`);
  }
  const archive = join(toolchain, `zig-${host}-${zigVersion}.tar.xz`);
  await download(release.tarball, archive);
  const checksum = createHash("sha256").update(readFileSync(archive)).digest("hex");
  if (checksum !== release.shasum) {
    rmSync(archive);
    throw new Error(`checksum mismatch for ${release.tarball}`);
  }
  run("tar", ["-xJf", archive, "-C", toolchain]);
  rmSync(archive);
  return directory;
}

async function download(url, destination) {
  const response = await fetch(url, { headers: { "User-Agent": userAgent } });
  if (!response.ok) {
    throw new Error(`downloading ${url} failed with HTTP ${response.status}`);
  }
  mkdirSync(join(destination, ".."), { recursive: true });
  const partial = `${destination}.partial`;
  writeFileSync(partial, Buffer.from(await response.arrayBuffer()));
  renameSync(partial, destination);
}
