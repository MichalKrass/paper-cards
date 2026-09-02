import fs from "node:fs";
import path from "node:path";
import { test } from "@playwright/test";

const output = path.resolve("artifacts/visual");
fs.mkdirSync(output, { recursive: true });

const viewports = [
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "desktop-1440x900", width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`首页 ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("./");
    await page.screenshot({ path: path.join(output, `home-${viewport.name}.png`), fullPage: true });
  });

  test(`详情 ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("papers/arxiv-2304.07193/");
    await page.screenshot({ path: path.join(output, `detail-${viewport.name}.png`), fullPage: true });
  });
}

test("组合筛选状态", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./");
  await page.getByLabel("任务").selectOption("开放集目标检测");
  await page.getByLabel("证据").selectOption("abstract");
  await page.screenshot({ path: path.join(output, "filter-combined-desktop.png"), fullPage: true });
});

test("手机无结果状态", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.getByRole("searchbox", { name: "搜索" }).fill("long-unmatched-keyword-abcdefghijklmnopqrstuvwxyz");
  await page.screenshot({ path: path.join(output, "empty-mobile.png"), fullPage: true });
});
