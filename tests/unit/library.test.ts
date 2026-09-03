import { describe, expect, it } from "vitest";
import { filterAndSort, matchesPaper, normalizeText } from "../../src/lib/library";
import type { SearchRecord } from "../../src/lib/types";

const records: SearchRecord[] = [
  {
    id: "new",
    searchText: "分割 segment anything alexander 图像分割",
    task: "图像分割",
    institutions: ["Meta AI"],
    year: 2023,
    status: "verified",
    evidenceLevel: "abstract",
    publicationDate: "2023-04-05",
    title: "Segment Anything",
  },
  {
    id: "old",
    searchText: "开放集 grounding dino object detection",
    task: "开放集目标检测",
    institutions: ["IDEA Research"],
    year: 2022,
    status: "needs_review",
    evidenceLevel: "fulltext",
    publicationDate: "2022-03-09",
    title: "Grounding DINO",
  },
];

describe("normalizeText", () => {
  it("normalizes case, width and whitespace", () => {
    expect(normalizeText("  ＳＡＭ   Vision  ")).toBe("sam vision");
  });
});

describe("paper filtering", () => {
  it("matches Chinese and English text", () => {
    expect(matchesPaper(records[0], { query: "SEGMENT ANYTHING" })).toBe(true);
    expect(matchesPaper(records[0], { query: "开放集" })).toBe(false);
  });

  it("combines filters with AND semantics", () => {
    expect(filterAndSort(records, { task: "图像分割", institution: "Meta AI", year: "2023", evidenceLevel: "abstract" }).map((item) => item.id)).toEqual(["new"]);
    expect(filterAndSort(records, { task: "图像分割", status: "needs_review" })).toEqual([]);
    expect(filterAndSort(records, { institution: "IDEA Research" }).map((item) => item.id)).toEqual(["old"]);
  });

  it("supports every sorting mode without mutating expectations", () => {
    expect(filterAndSort([...records], { sort: "newest" }).map((item) => item.id)).toEqual(["new", "old"]);
    expect(filterAndSort([...records], { sort: "oldest" }).map((item) => item.id)).toEqual(["old", "new"]);
    expect(filterAndSort([...records], { sort: "title" }).map((item) => item.id)).toEqual(["old", "new"]);
  });
});
