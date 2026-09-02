import type { Paper } from "./types";

const modules = import.meta.glob("../../data/papers/*.json", {
  eager: true,
  import: "default",
});

export const papers = Object.values(modules) as Paper[];

papers.sort((a, b) => b.publicationDate.localeCompare(a.publicationDate));

export const paperById = new Map(papers.map((paper) => [paper.id, paper]));

export const uniqueValues = (items: string[]) => [...new Set(items)].sort((a, b) => a.localeCompare(b, "zh-CN"));
