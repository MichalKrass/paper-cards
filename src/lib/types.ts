export type EvidenceLevel = "fulltext" | "abstract" | "wechat_only" | "mixed";
export type ReviewStatus = "draft" | "verified" | "needs_review";
export type JudgementLevel = "low" | "medium" | "high" | "unknown";

export interface SourceLink {
  label: string;
  url: string;
  kind: "paper" | "code" | "project" | "article";
}

export interface KeyMetric {
  name: string;
  result: string;
  baseline: string;
  source: string;
}

export interface Judgement {
  level: JudgementLevel;
  reason: string;
}

export interface Paper {
  id: string;
  title: string;
  titleZh?: string;
  authors: string[];
  institutions?: string[];
  publicationDate: string;
  year: number;
  doi?: string;
  arxivId?: string;
  paperUrl?: string;
  codeUrl?: string;
  sourceArticleIds: string[];
  sources: SourceLink[];
  evidenceLevel: EvidenceLevel;
  status: ReviewStatus;
  oneLineSummary: string;
  task: string;
  applicationScenarios: string[];
  problem: string;
  coreMethod: string;
  valuableInnovations: string[];
  keyMetrics: KeyMetric[];
  tags: string[];
  modelStructure?: string;
  trainingStrategy?: string;
  dataRecipe?: string;
  trainingDatasets?: string[];
  testDatasets?: string[];
  changesFromPrevious?: string;
  openSourceStatus?: Judgement;
  codeMaturity?: Judgement;
  reproductionDifficulty?: Judgement;
  computeRequirement?: Judgement;
  industrialValue?: Judgement;
  commercialValue?: Judgement;
  limitations: string[];
  followUpQuestions: string[];
  addedAt: string;
  updatedAt: string;
  schemaVersion: string;
  generatedBy?: string;
}

export interface SearchRecord {
  id: string;
  searchText: string;
  task: string;
  institutions: string[];
  year: number;
  status: ReviewStatus;
  evidenceLevel: EvidenceLevel;
  publicationDate: string;
  title: string;
}

export interface LibraryQuery {
  query?: string;
  task?: string;
  institution?: string;
  year?: string;
  status?: string;
  evidenceLevel?: string;
  sort?: "newest" | "oldest" | "title";
}
