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
  ["explainers", "explainer.schema.json"],
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
    const recordId = folder === "explainers" ? value.paperId : value.id;
    const key = `${folder}:${recordId}`;
    if (records.has(key)) {
      failures += 1;
      console.error(`\nDuplicate id ${recordId}: ${records.get(key)} and ${relative}`);
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

const dimensionLabels = [
  "标题", "机构与作者", "发布日期", "任务", "应用场景", "解决的问题", "核心方法",
  "模型结构", "训练策略", "数据配方", "训练集与测试集", "主要指标", "相对上一代方法的变化",
  "真正有价值的创新", "是否开源以及开源地址", "代码成熟度", "复现难度", "算力需求",
  "工业落地价值", "商业价值判断", "局限", "后续值得关注的问题",
];

const explainerFiles = jsonFiles(path.join(dataRoot, "explainers"));
const explainedPaperIds = new Set();
for (const file of explainerFiles) {
  const explainer = readJson(file);
  const relative = path.relative(dataRoot, file);
  if (!paperIds.has(explainer.paperId)) {
    failures += 1;
    console.error(`\n${relative} references missing paper: ${explainer.paperId}`);
  }
  if (explainedPaperIds.has(explainer.paperId)) {
    failures += 1;
    console.error(`\nDuplicate explainer for paper: ${explainer.paperId}`);
  }
  explainedPaperIds.add(explainer.paperId);

  const ids = (explainer.dimensions ?? []).map((item) => item.id);
  const expectedIds = Array.from({ length: 22 }, (_, index) => index + 1);
  if (JSON.stringify(ids) !== JSON.stringify(expectedIds)) {
    failures += 1;
    console.error(`\n${relative} dimensions must be ordered exactly from 1 to 22.`);
  }
  const labels = (explainer.dimensions ?? []).map((item) => item.label);
  if (JSON.stringify(labels) !== JSON.stringify(dimensionLabels)) {
    failures += 1;
    console.error(`\n${relative} dimension labels must exactly match 论文卡片格式.txt.`);
  }
}

for (const paperId of paperIds) {
  if (!explainedPaperIds.has(paperId)) {
    failures += 1;
    console.error(`\nMissing explainer for paper: ${paperId}`);
  }
}

if (failures > 0) {
  console.error(`\nData validation failed with ${failures} problem(s).`);
  process.exit(1);
}

console.log(`Validated ${paperIds.size} papers, ${explainerFiles.length} explainers, and ${jsonFiles(path.join(dataRoot, "articles")).length} source articles.`);
