import Ajv from "ajv";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";
import paperSchema from "../../data/schema/paper.schema.json";
import explainerSchema from "../../data/schema/explainer.schema.json";
import validPaper from "../../data/papers/arxiv-2304.02643.json";
import validExplainer from "../../data/explainers/arxiv-2304.02643.json";

describe("paper JSON Schema", () => {
  it("rejects a file after a required field is removed and names that field", () => {
    const ajv = new Ajv({ allErrors: true, strict: true });
    addFormats(ajv);
    const validate = ajv.compile(paperSchema);
    const invalidPaper: Record<string, unknown> = structuredClone(validPaper);
    delete invalidPaper.title;

    expect(validate(invalidPaper)).toBe(false);
    expect(validate.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({
        keyword: "required",
        params: { missingProperty: "title" },
      }),
    ]));
  });
});

describe("explainer JSON Schema", () => {
  it("requires exactly 22 explanation dimensions", () => {
    const ajv = new Ajv({ allErrors: true, strict: true });
    addFormats(ajv);
    const validate = ajv.compile(explainerSchema);
    const invalidExplainer: Record<string, unknown> = structuredClone(validExplainer);
    invalidExplainer.dimensions = validExplainer.dimensions.slice(0, 21);

    expect(validate(invalidExplainer)).toBe(false);
    expect(validate.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ keyword: "minItems" }),
    ]));
  });
});
