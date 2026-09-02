import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

test("短内容在打印媒体下保留正文并隐藏操作", async ({ page }) => {
  await page.goto("papers/arxiv-2303.05499/");
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("heading", { name: /Grounding DINO/, level: 1 })).toBeVisible();
  await expect(page.locator("[data-print-hide]").first()).toBeHidden();
  await expect(page.getByText("52.5 AP")).toBeVisible();
});

test("长内容生成非空A4 PDF", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Chromium 才支持 page.pdf");
  const outputDirectory = path.resolve("output/pdf");
  const outputFile = path.join(outputDirectory, "paper-card-sample.pdf");
  fs.mkdirSync(outputDirectory, { recursive: true });
  await page.goto("papers/arxiv-2304.07193/");
  await page.emulateMedia({ media: "print" });
  await page.pdf({ path: outputFile, format: "A4", printBackground: true, preferCSSPageSize: true });
  const file = fs.statSync(outputFile);
  expect(file.size).toBeGreaterThan(20_000);
  expect(fs.readFileSync(outputFile).subarray(0, 4).toString()).toBe("%PDF");
});
