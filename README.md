# Paper Cards

一个公开、移动端友好的个人论文卡片网站。首页先展示足够简洁的卡片；点击后进入完整详情，并可用浏览器的一键打印流程保存为 PDF。

本项目没有数据库和后台服务。论文数据、页面代码与构建流程全部保存在同一个 GitHub 仓库中，便于审查、回滚和长期维护。

## 当前范围

MVP 包含：

- 卡片与详情两层阅读；
- 中文和英文关键词搜索；
- 任务、年份、核验状态、证据等级筛选；
- 日期和标题排序；
- 浏览器打印 / 保存 PDF；
- JSON Schema 数据校验；
- 单元、端到端、无障碍、视觉和 PDF 检查；
- GitHub Actions 构建并部署到 GitHub Pages。

暂不包含登录、在线编辑、个人笔记同步、微信自动采集、语义搜索和服务端数据库。

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
npm run test:e2e       # 生产构建上的端到端与无障碍测试
npm run test:visual    # 生成三档视口截图
npm run test:pdf       # 检查打印样式并生成 A4 PDF
npm run build          # 生产构建
npm run verify         # CI 使用的聚合验证命令
```

首次运行浏览器测试前还需安装 Chromium：

```bash
npx playwright install chromium
```

## 添加一篇论文

1. 复制 `data/papers/` 中最接近的新建卡片作为起点。
2. 使用稳定 ID：优先 DOI，其次 arXiv ID。
3. 未确认的可选字段直接省略，不要猜测。
4. 指标必须同时写明结果、对比条件和证据来源。
5. 价值判断必须包含等级和理由。
6. 运行 `npm run data:validate`。错误信息会给出文件与字段路径。

页面只读取纯文本和受控数组，不接受数据文件中的 HTML。

## 数据目录

- `data/papers/`：每篇论文一个 JSON 文件，是网站内容的唯一事实源。
- `data/articles/`：微信公众号文章来源和可访问状态。
- `data/schema/`：两类数据的 JSON Schema。
- `scripts/`：构建前校验和搜索索引生成。
- `src/`：页面、组件、样式与轻量交互。
- `tests/`：单元、端到端、视觉与 PDF 检查。

## 部署到 GitHub Pages

推荐仓库名为 `paper-cards`，公开网址将是：

```text
https://<你的GitHub用户名>.github.io/paper-cards/
```

部署步骤：

1. 在 GitHub 创建公开仓库 `paper-cards`，把本地内容推送到 `main` 或 `master`。
2. 打开仓库 **Settings → Pages**，把 **Source** 设为 **GitHub Actions**。
3. `Deploy to GitHub Pages` 工作流会先执行数据校验、类型检查、单元测试、端到端测试和生产构建；全部通过后才部署。
4. 在 Actions 页面确认 `deploy` 任务成功，再验证首页、任一详情直链以及刷新。

不需要把 GitHub 密码写进代码或交给任何人。本机首次推送建议使用 `gh auth login` 的浏览器授权；GitHub Actions 部署使用仓库自带的短期令牌。

如果仓库名不是 `paper-cards`，Astro 会在 GitHub Actions 中自动读取实际仓库名作为基础路径；本地测试默认仍使用 `/paper-cards/`，可通过 `BASE_PATH` 环境变量覆盖。

## 失败恢复

- 数据错误：构建会在部署前失败；修正对应 JSON 后重新提交。
- 测试或构建错误：GitHub Pages 保留上一次成功版本，不会发布失败产物。
- 线上异常：在 GitHub 中回退导致异常的提交，或对最后一个正常提交执行 `git revert`，然后重新运行部署工作流。
- 依赖升级异常：还原 `package.json` 与 `package-lock.json`，执行 `npm ci` 后复验。
- 来源失效：保留来源记录，将状态改为 `removed` 或 `blocked`，并写明日期与原因。

## 视觉与 PDF 产物

视觉测试把固定视口截图写入 `artifacts/visual/`；PDF 测试把代表性详情页写入 `output/pdf/paper-card-sample.pdf`。这些目录用于本地验收，截图和测试临时文件默认不提交。
