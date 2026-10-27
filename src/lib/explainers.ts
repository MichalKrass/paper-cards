export type ExplainerVisualKind = "flow" | "steps" | "stats" | "bars" | "compare";

export interface ExplainerVisualItem {
  label: string;
  value?: string;
  note?: string;
  score?: number;
  max?: number;
  tone?: "accent" | "neutral" | "good" | "warn";
}

export interface ExplainerVisual {
  kind: ExplainerVisualKind;
  title: string;
  caption?: string;
  items: ExplainerVisualItem[];
}

export interface ExplainerDimension {
  id: number;
  label: string;
  summary: string;
  bullets: string[];
  visual?: ExplainerVisual;
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
