export type OriginalAssetKind = "figure" | "table" | "equation" | "excerpt";

export interface OriginalPaperAsset {
  kind: OriginalAssetKind;
  src: string;
  label: string;
  pdfPage: number;
  alt: string;
  caption: string;
  explanation: string[];
}

export interface ExplainerDimension {
  id: number;
  label: string;
  summary: string;
  bullets: string[];
  visual?: OriginalPaperAsset;
}

export interface PaperExplainer {
  paperId: string;
  readingMinutes: number;
  sourceVersion: string;
  sourceSections: string[];
  takeaways: string[];
  dimensions: ExplainerDimension[];
}

const modules = import.meta.glob("../../data/explainers/*.json", {
  eager: true,
  import: "default",
});

export const explainers = Object.values(modules) as PaperExplainer[];
export const explainerByPaperId = new Map(explainers.map((item) => [item.paperId, item]));

export function getPaperExplainer(paperId: string): PaperExplainer {
  const explainer = explainerByPaperId.get(paperId);
  if (!explainer) throw new Error(`Missing explainer for paper: ${paperId}`);
  return explainer;
}
