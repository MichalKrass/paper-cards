import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const root = process.cwd();
const dataRoot = process.env.PAPER_CARDS_DATA_ROOT
  ? path.resolve(process.env.PAPER_CARDS_DATA_ROOT)
  : path.join(root, "data");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const jsonFiles = (directory) => fs.readdirSync(directory)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => path.join(directory, name));

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

const targets = [
  ["papers", "paper.schema.json"],
  ["articles", "article.schema.json"],
];

let failures = 0;
const records = new Map();

for (const [folder, schemaName] of targets) {
  const schema = readJson(path.join(dataRoot, "schema", schemaName));
  const validate = ajv.compile(schema);
  for (const file of jsonFiles(path.join(dataRoot, folder))) {
    const value = readJson(file);
    const relative = path.relative(dataRoot, file);
    if (!validate(value)) {
      failures += 1;
      console.error(`\n${relative}`);
      for (const error of validate.errors ?? []) {
        console.error(`  ${error.instancePath || "/"} ${error.message}`);
      }
    }
    const key = `${folder}:${value.id}`;
    if (records.has(key)) {
      failures += 1;
      console.error(`\nDuplicate id ${value.id}: ${records.get(key)} and ${relative}`);
    }
    records.set(key, relative);
  }
}

const paperIds = new Set([...records.keys()].filter((key) => key.startsWith("papers:")).map((key) => key.slice(7)));
for (const file of jsonFiles(path.join(dataRoot, "articles"))) {
  const article = readJson(file);
  for (const paperId of article.linkedPaperIds ?? []) {
    if (!paperIds.has(paperId)) {
      failures += 1;
      console.error(`\n${path.relative(dataRoot, file)} references missing paper: ${paperId}`);
    }
  }
}

if (failures > 0) {
  console.error(`\nData validation failed with ${failures} problem(s).`);
  process.exit(1);
}

console.log(`Validated ${paperIds.size} papers and ${jsonFiles(path.join(dataRoot, "articles")).length} source articles.`);
