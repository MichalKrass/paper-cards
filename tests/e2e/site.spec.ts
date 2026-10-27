import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const dimensionLabels = [
  "标题", "机构与作者", "发布日期", "任务", "应用场景", "解决的问题", "核心方法",
  "模型结构", "训练策略", "数据配方", "训练集与测试集", "主要指标", "相对上一代方法的变化",
  "真正有价值的创新", "是否开源以及开源地址", "代码成熟度", "复现难度", "算力需求",
  "工业落地价值", "商业价值判断", "局限", "后续值得关注的问题",
];

test("第一层显示三篇轻量速览卡片和正确基础路径", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "论文库", level: 1 })).toBeVisible();
  await expect(page.locator("[data-paper-id]")).toHaveCount(3);
  await expect(page.locator("[data-result-count]")).toHaveText("显示 3 / 3 篇");

  const samCard = page.locator('[data-paper-id="arxiv-2304.02643"]');
  await expect(samCard).toContainText("Segment Anything");
  await expect(samCard).toContainText("2023-04-05");
  await expect(samCard).toContainText("Meta AI Research");
  await expect(samCard).toContainText("图像分割");
  await expect(samCard).toContainText("把图像分割做成可提示的基础能力");
  await expect(samCard).not.toContainText("主要指标");
  await expect(page.getByRole("link", { name: "查看《Segment Anything》论文卡片" })).toHaveAttribute("href", "/paper-cards/papers/arxiv-2304.02643/");
});

test("搜索、机构组合筛选、标签移除、URL恢复、排序和重置", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("searchbox", { name: "搜索" }).fill("Grounding DINO");
  await expect(page.locator("[data-result-count]")).toHaveText("显示 1 / 3 篇");
  await expect(page.locator("[data-paper-id]:visible")).toHaveCount(1);

  await page.getByRole("searchbox", { name: "搜索" }).fill("");
  await page.locator(".filter-disclosure summary").click();
  await page.getByLabel("领域").selectOption("图像分割");
  await page.getByLabel("机构").selectOption("Meta AI Research");
  await page.getByLabel("证据范围").selectOption("fulltext");
  await expect(page.locator("[data-result-count]")).toHaveText("显示 1 / 3 篇");
  await expect(page.locator("[data-filter-summary]")).toHaveText("筛选 · 3");
  await expect(page).toHaveURL(/task=.*institution=.*evidenceLevel=fulltext/);

  await page.getByRole("button", { name: "移除领域筛选：图像分割" }).click();
  await expect(page.locator("[data-filter-summary]")).toHaveText("筛选 · 2");

  await page.reload();
  await expect(page.locator('select[name="institution"]')).toHaveValue("Meta AI Research");
  await expect(page.locator("[data-result-count]")).toHaveText("显示 2 / 3 篇");

  await page.getByRole("button", { name: "重置" }).click();
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

test("第二层严格显示22个维度，未生成章节时不出现无效链接", async ({ page }) => {
  await page.goto("papers/arxiv-2304.02643/");
  await expect(page.getByRole("heading", { name: "Segment Anything", level: 1 })).toBeVisible();
  const labels = await page.locator("[data-dimension-id] h3").allTextContents();
  expect(labels).toEqual(dimensionLabels);
  await expect(page.locator("[data-dimension-id]")).toHaveCount(22);
  await expect(page.locator("[data-original-paper-asset]")).toHaveCount(8);
  await expect(page.getByRole("heading", { name: "先记住这三点" })).toBeVisible();
  await expect(page.getByText("原论文 Figure 4")).toBeVisible();
  await expect(page.getByRole("link", { name: /进入章节精读/ })).toHaveAttribute("href", "/paper-cards/papers/arxiv-2304.02643/reading/");
  await expect(page.getByRole("link", { name: /打开原论文/ })).toHaveAttribute("href", "https://arxiv.org/abs/2304.02643");

  await page.goto("papers/arxiv-2304.07193/");
  await expect(page.getByText("章节精读尚未生成")).toBeVisible();
  await expect(page.getByRole("link", { name: /进入章节精读/ })).toHaveCount(0);
  await expect(page.locator("[data-dimension-id]")).toHaveCount(22);
  await expect(page.getByText("原论文 §4 的 DINO 与 iBOT 公式")).toBeVisible();

  await page.goto("papers/arxiv-2303.05499/");
  await expect(page.locator("[data-dimension-id]")).toHaveCount(22);
  await expect(page.getByText("原论文 Figure 3")).toBeVisible();
});

test("第一层到第三层及返回路径、章节目录与原图均可用", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("link", { name: "查看《Segment Anything》论文卡片" }).click();
  await expect(page).toHaveURL(/\/paper-cards\/papers\/arxiv-2304\.02643\/$/);
  await page.getByRole("link", { name: /进入章节精读/ }).click();
  await expect(page).toHaveURL(/\/paper-cards\/papers\/arxiv-2304\.02643\/reading\/$/);
  await expect(page.getByRole("heading", { name: "Segment Anything", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "3. Segment Anything Model", level: 2 })).toBeVisible();
  await expect(page.getByRole("img", { name: /SAM 模型结构图/ })).toHaveAttribute("src", "/paper-cards/papers/arxiv-2304.02643/figures/model-diagram.png");
  await page.locator(".reading-toc").getByRole("link", { name: /3\. Segment Anything Model/ }).click();
  await expect(page).toHaveURL(/#3-segment-anything-model$/);
  await page.getByRole("link", { name: "返回论文卡片" }).click();
  await expect(page).toHaveURL(/\/paper-cards\/papers\/arxiv-2304\.02643\/$/);
});

test("三层页面均无PDF入口和严重自动无障碍问题", async ({ page }) => {
  for (const path of ["./", "papers/arxiv-2304.02643/", "papers/arxiv-2304.02643/reading/"]) {
    await page.goto(path);
    await expect(page.getByText(/导出.*PDF|保存.*PDF/i)).toHaveCount(0);
    const results = await new AxeBuilder({ page }).exclude(".source-note").analyze();
    expect(results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""))).toEqual([]);
  }
});

test("键盘焦点可见且筛选表单均有标签", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator(".brand")).toBeFocused();
  await expect(page.locator(".library-controls label")).toHaveCount(7);
});

test("手机三层页面没有整页横向溢出", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["./", "papers/arxiv-2304.02643/", "papers/arxiv-2304.02643/reading/"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});

test("第二层只使用带来源说明的原论文图表和公式", async ({ page }) => {
  for (const path of ["papers/arxiv-2304.02643/", "papers/arxiv-2304.07193/", "papers/arxiv-2303.05499/"]) {
    await page.goto(path);
    await expect(page.locator(".explain-visual")).toHaveCount(0);
    const assets = page.locator("[data-original-paper-asset]");
    expect(await assets.count()).toBeGreaterThanOrEqual(6);
    for (const asset of await assets.all()) {
      await expect(asset.locator("figcaption")).toContainText("怎么读这张原图");
      await expect(asset.locator("img")).toHaveAttribute("src", /\/original\/.+\.webp$/);
      await expect(asset.locator("img")).not.toHaveAttribute("alt", "");
      await expect(asset.getByRole("link", { name: /回到原论文/ })).toHaveAttribute("href", /^https:\/\/arxiv\.org\/abs\//);
    }
  }
});
