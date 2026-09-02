import type { LibraryQuery, SearchRecord } from "./types";

export function normalizeText(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("zh-CN").replace(/\s+/g, " ").trim();
}

export function matchesPaper(paper: SearchRecord, query: LibraryQuery): boolean {
  const normalizedQuery = normalizeText(query.query ?? "");
  if (normalizedQuery && !paper.searchText.includes(normalizedQuery)) return false;
  if (query.task && paper.task !== query.task) return false;
  if (query.year && String(paper.year) !== query.year) return false;
  if (query.status && paper.status !== query.status) return false;
  if (query.evidenceLevel && paper.evidenceLevel !== query.evidenceLevel) return false;
  return true;
}

export function filterAndSort(records: SearchRecord[], query: LibraryQuery): SearchRecord[] {
  const result = records.filter((record) => matchesPaper(record, query));
  const sort = query.sort ?? "newest";
  return result.sort((a, b) => {
    if (sort === "oldest") return a.publicationDate.localeCompare(b.publicationDate);
    if (sort === "title") return a.title.localeCompare(b.title, "en");
    return b.publicationDate.localeCompare(a.publicationDate);
  });
}
