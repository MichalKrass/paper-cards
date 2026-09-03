import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const notesDirectory = path.join(root, "content", "reading-notes");
const papersDirectory = path.join(root, "data", "papers");
const errors = [];

const paperIds = new Set(
  fs.readdirSync(papersDirectory)
    .filter((name) => name.endsWith(".json"))
    .map((name) => JSON.parse(fs.readFileSync(path.join(papersDirectory, name), "utf8")).id),
);

const readScalar = (block, key, indentation = "") => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = block.match(new RegExp(`^${indentation}${escapedKey}:\\s*(?:"([^"]*)"|'([^']*)'|([^\\r\\n#]+))\\s*$`, "m"));
  return (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
};

if (!fs.existsSync(notesDirectory)) {
  errors.push("Missing content/reading-notes directory.");
} else {
  const noteFiles = fs.readdirSync(notesDirectory).filter((name) => name.endsWith(".md")).sort();

  for (const fileName of noteFiles) {
    const filePath = path.join(notesDirectory, fileName);
    const content = fs.readFileSync(filePath, "utf8");
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    const report = (message) => errors.push(`${path.relative(root, filePath)}: ${message}`);

    if (!match) {
      report("missing YAML frontmatter");
      continue;
    }

    const [, frontmatter, body] = match;
    const paperId = readScalar(frontmatter, "paperId");
    const status = readScalar(frontmatter, "status");
    const sourceVersion = readScalar(frontmatter, "sourceVersion");
    const sourceUrl = readScalar(frontmatter, "sourceUrl");
    const generatedAt = readScalar(frontmatter, "generatedAt");
    const evidence = readScalar(frontmatter, "evidence");
    const description = readScalar(frontmatter, "description");

    if (!paperId) report("paperId is required");
    if (paperId && path.basename(fileName, ".md") !== paperId) report("file name must equal paperId");
    if (paperId && !paperIds.has(paperId)) report(`paperId '${paperId}' does not exist in data/papers`);
    if (!["draft", "complete"].includes(status)) report("status must be draft or complete");
    if (!sourceVersion) report("sourceVersion is required");
    if (!description) report("description is required");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(generatedAt)) report("generatedAt must use YYYY-MM-DD");
    if (!/^https:\/\//.test(sourceUrl)) report("sourceUrl must be an HTTPS URL");
    if (status === "complete" && evidence !== "fulltext") report("complete notes must use fulltext evidence");

    const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map((heading) => heading[1].trim());
    if (headings.length === 0) report("at least one level-two chapter heading is required");
    if (new Set(headings).size !== headings.length) report("chapter headings must be unique");
    if (/<script\b|javascript:/i.test(content)) report("script content is not allowed");

    if (/^figure:\s*$/m.test(frontmatter)) {
      const figureSrc = readScalar(frontmatter, "src", "  ");
      const figureAlt = readScalar(frontmatter, "alt", "  ");
      const figureCaption = readScalar(frontmatter, "caption", "  ");
      const figureSourceLabel = readScalar(frontmatter, "sourceLabel", "  ");
      const figureSourceUrl = readScalar(frontmatter, "sourceUrl", "  ");
      const expectedPrefix = `papers/${paperId}/figures/`;

      if (!figureSrc.startsWith(expectedPrefix) || figureSrc.includes("..")) report(`figure src must stay under public/${expectedPrefix}`);
      if (!figureAlt) report("figure alt is required");
      if (!figureCaption) report("figure caption is required");
      if (!figureSourceLabel) report("figure sourceLabel is required");
      if (!/^https:\/\//.test(figureSourceUrl)) report("figure sourceUrl must be an HTTPS URL");
      if (figureSrc && !fs.existsSync(path.join(root, "public", ...figureSrc.split("/")))) report(`figure file does not exist: public/${figureSrc}`);
    }
  }
}

if (errors.length) {
  console.error(`Reading-note validation failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`Validated reading notes for ${fs.existsSync(notesDirectory) ? fs.readdirSync(notesDirectory).filter((name) => name.endsWith(".md")).length : 0} papers.`);
