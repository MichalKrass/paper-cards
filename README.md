# Paper Cards

一个公开、移动端友好的个人论文阅读网站。首页先用轻量卡片建立第一印象，再进入 22 维结构化论文卡片；对已完成精读的论文，还可以按原文章节继续阅读图文总结。

本项目没有数据库和后台服务。论文数据、页面代码与构建流程全部保存在同一个 GitHub 仓库中，便于审查、回滚和长期维护。

## 当前范围

当前版本包含：

- 论文速览、22 维论文卡片和章节精读三层阅读；
- 22 个维度均采用“结论句 + 解释要点”的写法，并在核心方法、模型结构、训练策略、数据规模、指标和价值判断处使用轻量框图或图表；
- 中文和英文关键词搜索；
- 领域、机构、年份、核验状态、证据等级筛选；
- 日期和标题排序；
- JSON 与章节精读 Markdown 数据校验；
- 单元、端到端、无障碍和视觉检查；
- GitHub Actions 构建并部署到 GitHub Pages。

暂不包含 PDF 导出、登录、在线编辑、个人笔记同步、微信自动采集、语义搜索和服务端数据库。

## 样例数据说明

`papers_list.txt` 中的 3 条微信收藏链接在 2026-09-02 自动访问时均触发了微信的“环境异常，完成验证后继续访问”页面，因此无法可靠确认文章标题、公众号名称、发布日期和关联论文。对应状态保存在 `data/articles/`；临时的 `pass_ticket`、`exportkey` 等分享参数不会复制到公开数据中。

为了完整验证网站流程，`data/papers/` 暂时放入 3 篇可从 arXiv 与官方代码仓库核验的真实论文。它们不被冒充为上述微信文章中的论文。后续拿到文章正文、导出 HTML 或论文链接后，只需新增或替换 JSON 数据，不必改页面代码。

## 本地运行

需要 Node.js 22 或更高版本。

```bash
npm ci
npm run dev
```

本地地址为 `http://localhost:4321/paper-cards/`。

常用检查命令：

```bash
npm run data:validate  # 校验论文和文章来源数据
npm run check          # 数据、搜索索引和 Astro/TypeScript 检查
npm run test:unit      # 搜索、筛选和排序单元测试
npm run test:e2e       # 三层页面的端到端与无障碍测试
npm run test:visual    # 为三层页面生成三档视口截图
npm run build          # 生产构建
npm run verify         # CI 使用的聚合验证命令
```

首次运行浏览器测试前还需安装 Chromium：

```bash
npx playwright install chromium
```

## 添加一篇论文卡片

1. 复制 `data/papers/` 中最接近的基础记录，并在 `data/explainers/` 新建同 ID 的 22 维讲解。
2. 使用稳定 ID：优先 DOI，其次 arXiv ID。
3. 先阅读全文，再写讲解；未确认的内容不要猜测。
4. 每个维度先写一句能独立读懂的结论，再补 2–4 个最必要的解释点。
5. 只在关系、顺序或数量确实更容易看懂时加入框图或图表，不为装饰而画图。
6. 指标必须同时写明结果、对比条件和证据来源；价值判断必须写清等级和理由。
7. 运行 `npm run data:validate`。校验会检查论文关联、22 个维度的顺序、必填内容和图表结构。

页面只读取纯文本和受控数组，不接受数据文件中的 HTML。

## 添加章节精读

1. 先完整阅读与核对原论文，不得用摘要推断章节内容。
2. 新建 `content/reading-notes/<paper-id>.md`，文件名必须与论文 JSON 的 `id` 一致。
3. 按原论文真实章节顺序使用二级标题；记录论文版本、全文来源、整理日期和复核状态。
4. 需要图片时放入 `public/papers/<paper-id>/figures/`，同时填写替代文本、中文图注、原图编号和来源链接。
5. 运行 `npm run data:validate`；校验会检查论文关联、完成状态、章节、图注和本地图片路径。

## 数据目录

- `data/papers/`：首页速览和论文基础事实，每篇论文一个 JSON 文件。
- `data/explainers/`：第二层的 22 维全文讲解与轻量可视化数据，每篇论文一个 JSON 文件。
- `data/articles/`：微信公众号文章来源和可访问状态。
- `data/schema/`：论文、讲解和文章来源的 JSON Schema。
- `content/reading-notes/`：按原文章节组织的精读 Markdown。
- `public/papers/`：章节精读使用的本地图表。
- `scripts/`：构建前校验和搜索索引生成。
- `src/`：页面、组件、样式与轻量交互。
- `tests/`：单元、端到端、无障碍与视觉检查。

## 部署到 GitHub Pages

推荐仓库名为 `paper-cards`，公开网址将是：

```text
https://<你的GitHub用户名>.github.io/paper-cards/
```

部署步骤：

1. 在 GitHub 创建公开仓库 `paper-cards`，把本地内容推送到 `main` 或 `master`。
2. 打开仓库 **Settings → Pages**，把 **Source** 设为 **GitHub Actions**。
3. `Deploy to GitHub Pages` 工作流会先执行数据校验、类型检查、单元测试、端到端测试和生产构建；全部通过后才部署。
4. 在 Actions 页面确认 `deploy` 任务成功，再验证首页、论文卡片、章节精读直链以及刷新。

不需要把 GitHub 密码写进代码或交给任何人。本机首次推送建议使用 `gh auth login` 的浏览器授权；GitHub Actions 部署使用仓库自带的短期令牌。

如果仓库名不是 `paper-cards`，Astro 会在 GitHub Actions 中自动读取实际仓库名作为基础路径；本地测试默认仍使用 `/paper-cards/`，可通过 `BASE_PATH` 环境变量覆盖。

## 失败恢复

- 数据错误：构建会在部署前失败；修正对应 JSON 后重新提交。
- 测试或构建错误：GitHub Pages 保留上一次成功版本，不会发布失败产物。
- 线上异常：在 GitHub 中回退导致异常的提交，或对最后一个正常提交执行 `git revert`，然后重新运行部署工作流。
- 依赖升级异常：还原 `package.json` 与 `package-lock.json`，执行 `npm ci` 后复验。
- 来源失效：保留来源记录，将状态改为 `removed` 或 `blocked`，并写明日期与原因。

## 视觉产物

视觉测试把首页、论文卡片和章节精读在固定视口下的截图写入 `artifacts/visual/`。该目录用于本地验收，截图和测试临时文件默认不提交。
