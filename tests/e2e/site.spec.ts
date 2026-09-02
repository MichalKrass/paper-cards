import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("首页显示真实样例、总数和GitHub Pages基础路径", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "论文卡片" })).toBeVisible();
  await expect(page.locator("[data-paper-id]")).toHaveCount(3);
  await expect(page.locator("[data-result-count]")).toHaveText("显示 3 / 3 篇");
  await expect(page.getByRole("link", { name: /查看《分割一切》详情/ })).toHaveAttribute("href", "/paper-cards/papers/arxiv-2304.02643/");
});

test("搜索、组合筛选、排序和清空筛选", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("searchbox", { name: "搜索" }).fill("Grounding DINO");
  await expect(page.locator("[data-result-count]")).toHaveText("显示 1 / 3 篇");
  await expect(page.locator("[data-paper-id]:visible")).toHaveCount(1);

  await page.getByRole("searchbox", { name: "搜索" }).fill("");
  await page.getByLabel("任务").selectOption("图像分割");
  await page.getByLabel("证据").selectOption("abstract");
  await expect(page.locator("[data-result-count]")).toHaveText("显示 1 / 3 篇");

  await page.getByRole("button", { name: "清空筛选" }).first().click();
  await expect(page.locator("[data-result-count]")).toHaveText("显示 3 / 3 篇");
  await page.getByLabel("排序").selectOption("title");
  await expect(page.locator("[data-paper-id]").first()).toHaveAttribute("data-paper-id", "arxiv-2304.07193");
});

test("无结果状态可恢复", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("searchbox", { name: "搜索" }).fill("不会存在的论文标题 xyz-404");
  await expect(page.getByRole("heading", { name: "没有匹配的论文" })).toBeVisible();
  await page.locator("[data-empty-state]").getByRole("button", { name: "清空筛选" }).click();
  await expect(page.locator("[data-paper-id]")).toHaveCount(3);
});

test("卡片详情、返回和直接链接均可用", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("link", { name: /查看《分割一切》详情/ }).click();
  await expect(page).toHaveURL(/\/paper-cards\/papers\/arxiv-2304\.02643\/$/);
  await expect(page.getByRole("heading", { name: "分割一切", level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "论文卡片", exact: true }).click();
  await expect(page).toHaveURL(/\/paper-cards\/$/);

  await page.goto("papers/arxiv-2303.05499/");
  await expect(page.getByRole("heading", { name: /Grounding DINO/, level: 1 })).toBeVisible();
  await expect(page.getByText("未确认").first()).toBeVisible();
});

test("打印按钮调用浏览器打印流程，外部来源链接正确", async ({ page }) => {
  await page.goto("papers/arxiv-2304.02643/");
  await page.evaluate(() => {
    window.print = () => document.body.setAttribute("data-print-called", "true");
  });
  await page.getByRole("button", { name: "导出 / 保存 PDF" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-print-called", "true");
  await expect(page.getByRole("link", { name: /arXiv 摘要与论文/ })).toHaveAttribute("href", "https://arxiv.org/abs/2304.02643");
});

test("首页和详情页没有严重的自动无障碍问题", async ({ page }) => {
  for (const path of ["./", "papers/arxiv-2304.07193/"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).exclude(".source-note").analyze();
    expect(results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""))).toEqual([]);
  }
});

test("键盘焦点顺序可见且表单均有标签", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator(".brand")).toBeFocused();
  await expect(page.locator(".library-controls label")).toHaveCount(6);
});

test("手机页面没有整页横向溢出", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["./", "papers/arxiv-2304.07193/"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});
