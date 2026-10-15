import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { env } from "node:process";
import { join, resolve } from "node:path";

// Fills the choices of every setting that lists diagnostics with the rules
// registered by the bundled server release, read from its crate source in the
// Cargo registry (downloaded by `bundle:server`).

const repository = resolve(import.meta.dirname, "..");
const manifestPath = join(repository, "package.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const { serverCrate, serverVersion } = manifest.serverBundle;
const ruleListSettings = ["macaulay2.diagnostics.disabled"];

// The registration table of the published release.
const ruleTable = join(findCrateSource(), "src", "diagnostic_registry.rs");
if (!existsSync(ruleTable)) {
  throw new Error(`no diagnostic registration table at ${ruleTable}`);
}

const rules = readRegisteredRules(readFileSync(ruleTable, "utf8"));
if (rules.length === 0) {
  throw new Error(`no diagnostics registered in ${ruleTable}`);
}

const ruleSelectors = [...rules.map((rule) => rule.name), ...rules.map((rule) => rule.code)];
const selectorDescriptions = [
  ...rules.map((rule) => `\`${rule.code}\`: ${rule.summary}`),
  ...rules.map((rule) => `\`${rule.name}\`: ${rule.summary}`),
];
const properties = manifest.contributes.configuration.properties;
const declaredRuleLists = ruleListSettings.filter((setting) => properties[setting] !== undefined);
for (const setting of declaredRuleLists) {
  properties[setting].items.enum = ruleSelectors;
  properties[setting].items.markdownEnumDescriptions = selectorDescriptions;
}
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `${rules.length} rules from ${serverCrate} ${serverVersion} -> ${declaredRuleLists.join(", ")}`,
);

function findCrateSource() {
  const registrySources = join(env.CARGO_HOME ?? join(homedir(), ".cargo"), "registry", "src");
  const crateDirectory = `${serverCrate}-${serverVersion}`;
  const candidates = existsSync(registrySources)
    ? readdirSync(registrySources)
        .map((index) => join(registrySources, index, crateDirectory))
        .filter((path) => existsSync(path))
    : [];
  if (candidates.length === 0) {
    throw new Error(
      `${crateDirectory} is not in ${registrySources}; run \`npm run bundle:server\` first`,
    );
  }
  return candidates[0];
}

// Each registration is a doc comment followed by an entry naming its `code`
// and `name`; the first paragraph of the doc comment summarizes the rule.
function readRegisteredRules(source) {
  const registrations = source.slice(source.lastIndexOf("register_diagnostics! {"));
  const rules = [];
  let documentation = [];
  let entry = {};
  for (const line of registrations.split("\n")) {
    const docLine = line.match(/^\s*\/\/\/ ?(.*)$/);
    if (docLine !== null) {
      if (entry.documentation !== undefined) {
        entry = {};
      }
      documentation.push(docLine[1]);
      continue;
    }
    if (documentation.length > 0) {
      entry = { documentation };
      documentation = [];
    }
    entry.code ??= line.match(/\bcode: "([A-Z]\d{2})"/)?.[1];
    entry.name ??= line.match(/\bname: "([a-z][a-z-]*)"/)?.[1];
    if (entry.code !== undefined && entry.name !== undefined) {
      rules.push({ code: entry.code, name: entry.name, summary: summarize(entry.documentation ?? []) });
      entry = {};
    }
  }
  return rules;
}

function summarize(documentation) {
  const paragraphEnd = documentation.findIndex((line) => line.trim() === "");
  return documentation
    .slice(0, paragraphEnd === -1 ? undefined : paragraphEnd)
    .join(" ")
    .trim();
}
