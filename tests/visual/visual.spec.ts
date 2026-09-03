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

const routes = [
  { name: "home", path: "./" },
  { name: "card", path: "papers/arxiv-2304.02643/" },
  { name: "reading", path: "papers/arxiv-2304.02643/reading/" },
];

for (const viewport of viewports) {
  for (const route of routes) {
    test(`${route.name} ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(route.path);
      await page.screenshot({ path: path.join(output, `${route.name}-${viewport.name}.png`), fullPage: true });
    });
  }
}

test("组合筛选状态", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./");
  await page.locator(".filter-disclosure summary").click();
  await page.getByLabel("领域").selectOption("图像分割");
  await page.getByLabel("机构").selectOption("Meta AI Research");
  await page.getByLabel("证据范围").selectOption("abstract");
  await page.screenshot({ path: path.join(output, "filter-combined-desktop.png"), fullPage: true });
});

test("手机无结果状态", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.getByRole("searchbox", { name: "搜索" }).fill("long-unmatched-keyword-abcdefghijklmnopqrstuvwxyz");
  await page.screenshot({ path: path.join(output, "empty-mobile.png"), fullPage: true });
});
