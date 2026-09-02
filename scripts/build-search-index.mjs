import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const source = path.join(root, "data", "papers");
const destination = path.join(root, "src", "generated", "paper-index.json");
const normalize = (value) => value.normalize("NFKC").toLocaleLowerCase("zh-CN").replace(/\s+/g, " ").trim();

const papers = fs.readdirSync(source)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => JSON.parse(fs.readFileSync(path.join(source, name), "utf8")))
  .map((paper) => ({
    id: paper.id,
    searchText: normalize([
      paper.title,
      paper.titleZh,
      ...(paper.authors ?? []),
      paper.task,
      paper.oneLineSummary,
      paper.problem,
      ...(paper.tags ?? []),
    ].filter(Boolean).join(" ")),
    task: paper.task,
    year: paper.year,
    status: paper.status,
    evidenceLevel: paper.evidenceLevel,
    publicationDate: paper.publicationDate,
    title: paper.title,
  }));

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, `${JSON.stringify(papers, null, 2)}\n`, "utf8");
console.log(`Built search index for ${papers.length} papers.`);
