# Eric Blog

> 极简主义个人博客，基于 Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui，完美适配 GitHub Pages 静态部署。

## ✨ 特性

- **黑白极简设计** — 精心调校的中文排版，黑白主色调
- **静态部署** — 零成本部署到 GitHub Pages
- **Markdown 写作** — 在 `content/` 目录下编写 Markdown 文件，push 即发布
- **GFM 全面适配** — 完整支持 GitHub Flavored Markdown，包括任务列表、表格、删除线、脚注等
- **GitHub Alerts** — 原生支持 `[!NOTE]`、`[!TIP]`、`[!IMPORTANT]`、`[!WARNING]`、`[!CAUTION]` 五种 GitHub 风格提示块，带图标和主题色标识
- **LaTeX 数学公式** — 支持 `$行内公式$` 和 `$$块级公式$$`，基于 KaTeX 渲染，自动适配明暗主题
- **脚注** — 支持 `[^1]` 语法，自动生成脚注链接和底部注释区
- **Emoji 短代码** — 支持 `:smile:`、`:thumbsup:` 等 Emoji 短代码自动渲染
- **HTML Details** — 支持 `<details><summary>` 折叠面板，带 chevron 旋转动画
- **代码高亮** — 自动适配明暗主题的语法高亮 + 一键复制，使用 Prism.js 引擎
- **文章目录** — 自动生成 TOC + 滚动跟踪高亮
- **阅读时间** — 中英文混合估算
- **暗色模式** — 浅色/深色/跟随系统 三模式切换
- **响应式** — 完美适配桌面和移动端
- **Framer Motion 动画** — 丝滑的页面过渡和交互动画
- **视频背景首页** — 沉浸式的 Hero 区域
- **一言** — 每日随机语录
- **客户端搜索** — 全文搜索，即时响应
- **分类/标签** — 客户端筛选，无需服务器
- **AI 摘要** — 客户端直调外部 AI API（自配 Key）
- **Giscus 评论** — 基于 GitHub Discussions，完全免费

## 📝 Markdown 语法支持

### GitHub Alerts

使用 GitHub 风格的提示块语法，支持五种类型：

```markdown
> [!NOTE]
> 这是一个提示信息。

> [!TIP]
> 这是一个实用技巧。

> [!IMPORTANT]
> 这是重要信息。

> [!WARNING]
> 这是警告信息。

> [!CAUTION]
> 这是危险操作提示。
```

### LaTeX 数学公式

支持行内公式和块级公式：

```markdown
行内公式：$E = mc^2$

块级公式：
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

### 脚注

```markdown
这是一段带脚注的文本[^1]。

[^1]: 这是脚注内容。
```

### Emoji 短代码

```markdown
:smile: :heart: :thumbsup: :rocket:
```

### HTML Details / Summary

```html
<details>
<summary>点击展开</summary>
这里是折叠的内容。
</details>
```

### 任务列表

```markdown
- [x] 已完成的任务
- [ ] 待完成的任务
```

## 🚀 快速开始

### 1. Fork 或 Clone

```bash
git clone https://github.com/Eq52/Eq52.github.io.git
cd Eq52.github.io
```

### 2. 安装依赖

```bash
npm install
```

### 3. 本地开发

```bash
npm run dev
# 打开 http://localhost:3000
```

### 4. 写文章

在 `content/` 目录下创建 `.md` 文件，格式如下：

```markdown
---
title: 文章标题
category: 技术
tags: ["标签1", "标签2"]
summary: 文章摘要（可选）
coverImage: https://example.com/cover.jpg
status: published
visibility: public
createdAt: 2025-01-15
---

# 正文内容

支持标准 Markdown 语法、GitHub Alerts、LaTeX 公式、脚注、Emoji 短代码等。
```

### 5. 部署到 GitHub Pages

1. 将代码推送到 GitHub 仓库的 `main` 分支
2. 在仓库 Settings → Pages 中选择 **GitHub Actions** 作为部署源
3. 每次 push 到 main 分支会自动触发构建和部署

## ⚙️ 配置

编辑 `src/lib/site-config.ts` 自定义你的博客：

```typescript
export const siteConfig = {
  name: '你的博客名',
  author: '你的名字',
  github: 'https://github.com/你的用户名',
  // ... 更多配置
}
```

### 部署到子路径

如果你的仓库名不是 `username.github.io`，需要设置 `basePath`：

编辑 `next.config.ts`：
```typescript
basePath: '/你的仓库名',
```

### 配置 Giscus 评论

1. 访问 [giscus.app](https://giscus.app)
2. 按照指引获取配置
3. 填入 `src/lib/site-config.ts` 的 `giscus` 配置

### 配置 AI 摘要

1. 准备一个 OpenAI 兼容的 API Key（支持 DeepSeek、Moonshot 等）
2. 在博客设置中输入 API Key（存储在浏览器 localStorage）
3. 在 `site-config.ts` 中设置 `aiSummary.apiUrl` 和 `aiSummary.model`

## 📂 目录结构

```
Eq52.github.io/
├── content/              # Markdown 文章（push 即发布）
├── public/               # 静态资源
│   ├── avatar.jpg       # 头像
│   ├── logo.svg         # Logo
│   └── uploads/          # 图片（可选）
├── src/
│   ├── app/              # 页面
│   │   ├── page.tsx      # 首页
│   │   ├── article/[id]/ # 文章详情
│   │   ├── about/        # 关于
│   │   └── not-found.tsx # 404
│   ├── components/       # 组件
│   │   ├── blog/         # 博客组件（ArticleView、CommentSection 等）
│   │   └── ui/           # shadcn/ui 基础组件
│   ├── lib/              # 工具库
│   │   ├── site-config.ts # 站点配置（★ 自定义这里）
│   │   ├── build-data.ts  # 构建时数据加载
│   │   └── article-utils.ts # 文章工具函数
│   ├── styles/           # 样式
│   │   └── globals.css   # 全局样式 + Markdown 渲染美化 + KaTeX 样式
│   └── store/            # 状态管理
├── .github/workflows/    # GitHub Actions 部署
└── next.config.ts        # Next.js 配置
```

## 🔧 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router, Static Export) |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS 4 + shadcn/ui |
| 动画 | Framer Motion |
| Markdown | react-markdown + remark-gfm + rehype |
| 数学公式 | remark-math + rehype-katex |
| GitHub Alerts | remark-github-blockquote-alert |
| 脚注 | remark-footnotes |
| Emoji | remark-emoji |
| 代码高亮 | react-syntax-highlighter (Prism) — 明暗主题自适应 |
| 状态管理 | Zustand |
| 主题 | next-themes |
| 评论 | Giscus |
| 部署 | GitHub Pages + GitHub Actions |

## 📝 License

MIT
