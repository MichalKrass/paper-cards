import type { MarkdownInstance } from "astro";

export type ReadingNoteStatus = "draft" | "complete";

export interface ReadingFigure {
  src: string;
  alt: string;
  caption: string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface ReadingNoteFrontmatter {
  paperId: string;
  status: ReadingNoteStatus;
  sourceVersion: string;
  sourceUrl: string;
  generatedAt: string;
  evidence: "fulltext";
  description: string;
  figure?: ReadingFigure;
}

export type ReadingNote = MarkdownInstance<ReadingNoteFrontmatter>;

const noteModules = import.meta.glob<ReadingNote>("../../content/reading-notes/*.md", {
  eager: true,
});

export const readingNotes = Object.values(noteModules).sort((a, b) =>
  a.frontmatter.paperId.localeCompare(b.frontmatter.paperId),
);

export function getReadingNote(paperId: string): ReadingNote | undefined {
  return readingNotes.find((note) => note.frontmatter.paperId === paperId);
}

export function getReadingNoteStatus(paperId: string): ReadingNoteStatus | "missing" {
  return getReadingNote(paperId)?.frontmatter.status ?? "missing";
}
