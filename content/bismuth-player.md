---
title: Bismuth Player — 一个如"铋"般美丽的影视播放器外壳
category: 项目
tags: ["开源", "播放器", "React", "Vite", "TypeScript", "AppleCMS"]
summary: Bismuth Player 是一款基于苹果CMS API的在线影视流媒体应用，内置 SimPlayer 播放引擎，支持自定义视频源、搜索、播放历史、API 缓存等功能，拥有精致的暗色主题与流畅的动画体验。
coverImage: https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800
status: published
visibility: public
createdAt: 2026-06-02
---

# Bismuth Player 使用与部署指南

> 一个好看的、纯前端的影视播放器外壳。自己加源，自己看剧，数据全在本地。

**在线体验：** [ericq521.web.app/vid](https://ericq521.web.app/vid/)
**GitHub：** [Eq52/Bismuth-Player](https://github.com/Eq52/Bismuth-Player)

---

## 快速开始

最快的方式——什么都不用装，直接打开在线体验地址，三步就能看剧：

1. 打开 [ericq521.web.app/vid](https://ericq521.web.app/vid/)
2. 进入「设置 → 影视源 → 添加」，填入一个苹果 CMS API 地址
3. 回到首页，开看

如果你想自己部署，往下翻。

---

## 功能一览

### 界面特性

| 特性         | 说明                                       |
| :----------- | :----------------------------------------- |
| 🌙 深色主题   | 护眼暗色配色，适合夜间追剧                 |
| 🎨 渐变设计   | 紫色到粉色的优雅渐变，灵感来自化学元素"铋" |
| 📝 衬线字体   | 中文排版清晰，标题正文层次分明             |
| 📱 响应式布局 | 手机 / 平板 / 桌面端自适应，无需操心       |
| ✨ 动画效果   | 页面滑入滑出、图片淡入、启动闪屏、按钮反馈 |

**桌面端：** 左侧固定导航栏 + 宽屏视频卡片网格

**移动端：** 底部导航栏 + 紧凑卡片列表

### 核心功能

| 功能             | 详情                                                  |
| :--------------- | :---------------------------------------------------- |
| 🔗 自定义视频源   | 支持添加多个苹果 CMS API 源（JSON 格式），随时切换    |
| ▶️ 内置 SimPlayer | 支持 MP4 / WebM / HLS，含截图、画中画、倍速、进度记忆 |
| 🔧 外部播放器     | 可配置自定义播放器 URL，以 iframe 嵌入                |
| 📂 分类浏览       | 按分类筛选影片                                        |
| 🔍 搜索           | 关键词实时搜索                                        |
| 🕐 播放历史       | 自动记录观看进度，一键续播                            |
| 📺 选集播放       | 桌面端左右布局，剧集选择清晰                          |

### 性能优化

- **API 缓存** — 智能缓存响应数据，重复访问零请求
- **图片懒加载** — 滚动到可视区域才加载，省流量
- **骨架屏** — 数据加载时显示优雅占位
- **页面过渡动画** — 滑入滑出，流畅自然

---

## 添加你的第一个视频源

这是使用 Bismuth Player 的**核心步骤**。播放器本身不带任何内容，你需要手动接入视频源。

<details>
<summary>💡 什么是苹果 CMS API？</summary>


苹果 CMS（AppleCMS）是一套广泛使用的影视 CMS 系统，很多影视站都基于它搭建。它提供标准的 JSON API 接口，第三方播放器可以通过这些接口获取影片列表、详情和播放地址。

Bismuth Player 兼容所有遵循苹果 CMS 标准的 API，无论影视源来自哪个平台。
</details>

### 操作步骤

1. 点击底部导航栏的 **「设置」**
2. 选择 **「影视源」**
3. 点击右下角 **「+」** 按钮
4. 填写以下信息：

| 字段        | 说明                 | 示例                          |
| :---------- | :------------------- | :---------------------------- |
| **ID**      | 唯一标识符，英文即可 | `mysource`                    |
| **名称**    | 显示名称，中文随意   | `我的影视源`                  |
| **API URL** | 苹果 CMS API 地址    | `https://example.com/api.php` |

5. 点击 **「保存」**，回到首页

> [!TIP]
> 你可以同时添加多个视频源，在首页左上角切换。建议每个源先测试一下能不能正常加载，再加下一个。

### API 接口格式说明

Bismuth Player 会自动拼接以下标准参数，你只需要填写 API 的基础地址：

| 接口 | 参数                      | 用途                 |
| :--- | :------------------------ | :------------------- |
| 列表 | `?ac=videolist&pg=1`      | 获取影片列表（分页） |
| 详情 | `?ac=videolist&ids=123`   | 获取指定影片详情     |
| 搜索 | `?ac=videolist&wd=关键词` | 按关键词搜索         |

---

## 播放器配置

Bismuth Player 内置了 **SimPlayer** 播放引擎，开箱即用。

### SimPlayer 内置功能

SimPlayer 是我做的另一个独立项目 → [Eq52/Sim-Player](https://github.com/Eq52/Sim-Player)，功能清单：

| 功能        | 快捷键 / 操作                     |
| :---------- | :-------------------------------- |
| 播放 / 暂停 | 点击画面 / `Space` / `K`          |
| 快进 5 秒   | `→`                               |
| 快退 5 秒   | `←`                               |
| 音量调节    | `↑` `↓` / 悬停音量图标拖拽滑块    |
| 倍速切换    | 0.5x ~ 2x                         |
| 全屏        | 双击画面 / `F`                    |
| 画中画      | 点击 PiP 按钮                     |
| 截图        | 一键截取当前画面为 PNG            |
| 进度记忆    | 每 3 秒自动存档，下次打开自动恢复 |

### 使用外部播放器

如果你有自己偏好的播放器，可以在设置中配置：

1. 进入 **「设置 → 播放器」**
2. 在 **「自定义播放器地址」** 中填入播放器 URL
3. 播放器需要支持通过 URL 参数接收视频地址

> [!WARNING]
> 使用外部播放器时，部分功能（如截图、进度记忆）依赖外部播放器自身支持。

---

## 其他设置

### CORS 代理

> [!NOTE]
> 如果你遇到了视频加载失败、列表空白等问题，大概率是跨域（CORS）限制导致的。

**操作方法：**

1. 进入 **「设置 → CORS 代理」**
2. 添加一个 CORS 代理地址
3. 系统会在直连 API 失败时自动通过代理转发请求

你也可以**完全关闭** CORS 代理——如果你的视频源本身就支持跨域访问，关掉代理可以获得更快的响应速度。

<details>
<summary>🔧 CORS 代理的工作原理</summary>


浏览器有同源策略（Same-Origin Policy），当你从一个网页请求另一个域名的 API 时，如果对方没有返回允许跨域的响应头，浏览器就会拦截请求。

CORS 代理就是在中间加一个"中转站"——你的请求先发到代理服务器，由代理服务器去请求目标 API（服务器之间没有跨域限制），再把结果返回给你。

Bismuth Player 支持配置多个代理地址，并且会自动轮换，还内置了重试逻辑。
</details>

### 缓存管理

1. 进入 **「设置 → 缓存」**
2. 可以执行以下操作：

| 操作            | 说明                       |
| :-------------- | :------------------------- |
| 开启 / 关闭缓存 | 关闭后每次都会重新请求 API |
| 查看缓存统计    | 已缓存的数据量和条目数     |
| 清除缓存        | 一键清空所有缓存数据       |

### 播放历史

- 系统自动记录观看进度和观看列表
- 进入 **「历史」** 页面可查看所有记录
- 点击任意记录即可**一键续播**到上次的位置
- 所有历史数据存储在浏览器 `localStorage` 中

> [!TIP]
> 如果你换了浏览器或清除了浏览器数据，历史记录会丢失。这是预期行为——数据只存在于本地，不会上传到任何服务器。

---

## 部署教程

Bismuth Player 是纯前端应用（SPA），构建产物为静态文件，可以部署到任何静态托管平台。

### 前置条件

- [x] Node.js >= 18
- [x] npm / bun / pnpm（任选其一）

### 本地构建

```bash
# 克隆仓库
git clone https://github.com/Eq52/Bismuth-Player.git
cd Bismuth-Player

# 安装依赖
npm install

# 开发模式（热更新）
npm run dev

# 构建生产版本
npm run build

# 本地预览构建产物
npm run preview
```

构建完成后，`dist/` 目录就是你要部署的全部内容。

### 方式一：Vercel 一键部署

最简单的方式，适合不想折腾的人。

1. 登录 [vercel.com](https://vercel.com)，用 GitHub 账号授权
2. 点击 **「Add New Project」**
3. 选择 `Eq52/Bismuth-Player` 仓库
4. 保持默认配置，点击 **「Deploy」**
5. 等待构建完成，你会获得一个 `*.vercel.app` 的地址

或者用 Vercel CLI：

```bash
npm i -g vercel
cd Bismuth-Player
vercel --prod
```

### 方式二：Netlify 部署

1. 登录 [netlify.com](https://netlify.com)
2. 点击 **「Add new site → Import an existing project」**
3. 关联 GitHub，选择 `Bismuth-Player`
4. 构建命令填 `npm run build`，发布目录填 `dist`
5. 点击 **「Deploy site」**

### 方式三：Cloudflare Pages 部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **「Workers & Pages → Create」**
3. 选择 **「Connect to Git」**，关联 GitHub 仓库
4. 构建命令：`npm run build`
5. 输出目录：`dist`
6. 部署

### 方式四：本地构建 + Nginx

适合有自己服务器的用户。

```bash
# 构建
npm run build

# 将 dist 目录上传到服务器
scp -r dist/* user@your-server:/var/www/bismuth/
```

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/bismuth;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> [!IMPORTANT]
> `try_files` 必须包含 `/index.html` 回退。Bismuth Player 是 SPA，所有路由都需要由前端处理，如果 Nginx 直接返回 404，页面刷新后会白屏。

### 部署方式对比

| 方式             | 难度 | 自定义域名 |   免费额度   | 适合人群       |
| :--------------- | :--: | :--------: | :----------: | :------------- |
| Vercel           |  ⭐   |     ✅      |  100 次/天   | 所有人         |
| Netlify          |  ⭐   |     ✅      |   100GB/月   | 所有人         |
| Cloudflare Pages |  ⭐⭐  |     ✅      |     无限     | 有 CF 账号的人 |
| Nginx            | ⭐⭐⭐  |     ✅      | 取决于服务器 | 有服务器的用户 |

---

## 常见问题

<details>
<summary>❓ 添加视频源后首页是空的？</summary>


检查你的 API 地址是否正确。你可以在浏览器中直接访问 `你的API地址?ac=videolist&pg=1`，看看能不能返回 JSON 数据。如果地址没问题但还是空的，可能是 CORS 跨域问题——去「设置 → CORS 代理」配置一个代理试试。
</details>

<details>
<summary>❓ 视频播放失败 / 黑屏？</summary>


几个排查方向：

1. **格式问题** — 确认视频源提供的是 MP4、WebM 或 HLS（m3u8）格式，SimPlayer 支持这三种
2. **CORS 问题** — 视频地址本身可能不允许跨域访问，尝试开启 CORS 代理
3. **iOS 特殊情况** — iOS Safari 使用原生 HLS 引擎，和安卓/桌面端行为不同，V9.3.0 已修复已知的 iOS 兼容问题
4. **防盗链** — 部分视频源有 Referer 防盗链，SimPlayer 内置了 `no-referrer` 策略来绕过
   </details>

<details>
<summary>❓ 换了浏览器之后数据都没了？</summary>


正常。所有数据（播放历史、视频源配置、设置项）都存在浏览器的 `localStorage` 中，不会同步到云端。如果你想迁移数据，可以手动导出/导入 localStorage 中的键值对。
</details>

<details>
<summary>❓ 页面刷新后出现白屏？</summary>


这是 SPA 的常见问题。如果你用 Nginx 部署，检查是否配置了 `try_files $uri $uri/ /index.html;`。如果用 Vercel / Netlify，一般不会出现这个问题。
</details>

<details>
<summary>❓ 支持哪些视频源格式？</summary>


Bismuth Player 兼容所有**苹果 CMS 标准 API**（JSON 格式）。只要视频源遵循以下接口规范就可以接入：

- 列表接口返回包含 `list` 字段的 JSON
- 详情接口通过 `ids` 参数指定影片
- 搜索接口通过 `wd` 参数搜索

不支持非苹果 CMS 格式的自定义 API。
</details>

---

## 项目背后的故事

<details>
<summary>📖 为什么叫 Bismuth？</summary>


Bismuth 是化学元素**铋**。这种金属氧化之后会呈现出彩虹般的渐变色彩——紫的、蓝的、粉的、金色，每一块都独一无二。

我想要的播放器也是这种感觉：暗色基调，但带有精致的渐变，不是千篇一律的模板风格。所以就用这个名字了。
</details>

<details>
<summary>🤖 这个项目是 AI 写的？</summary>


是的，基本是。我负责提需求和找 Bug，实际编码由 GLM-5（Agent）、Kimi（Agent）、GLM-5-Turbo、GLM-4.7/4.6/4.6V/4.5 和 DeepSeek-R1/Chat 协作完成。

灵感来源于 [LibreTV](https://github.com/LibreSpark/LibreTV)——觉得它好用但需要后端，就想着弄个纯前端的版本。然后这个想法就在和 AI 的聊天中慢慢成型了。

到目前为止迭代了 95 次提交，到 V9.3.0。修过的 Bug 包括但不限于：首页加源不刷新、iOS Safari HLS 内存泄漏、分页变量未定义导致无限请求、API 畸形响应崩溃……

找 Bug 这件事，我已经很熟练了。
</details>

<details>
<summary>🔮 SimPlayer 是什么？</summary>


SimPlayer 是 Bismuth Player 内置的播放引擎，也是我做的另一个独立开源项目 → [Eq52/Sim-Player](https://github.com/Eq52/Sim-Player)

它是一个极简风格的 HTML5 视频播放器，基于 Next.js 16 + Tailwind CSS 4，支持 iframe 嵌入和 React 组件嵌入。除了截图、画中画、倍速这些基础功能，还做了 iOS 原生 HLS 兼容、防盗链绕过、断点续播提示等细节。

Minimax Agent 还用 Bismuth Player 做了一个 [Material Design 风格的版本](https://agent.minimaxi.com/share/381725144404201)，完全是 AI 自己的审美发挥，挺有意思的。
</details>

---

> 觉得好用的话，去 [GitHub](https://github.com/Eq52/Bismuth-Player) 给个 ⭐ 就是最大的鼓励了。遇到问题也欢迎提 Issue——反正找 Bug 这事，我熟。

---

*AI生成*
