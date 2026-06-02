---
title: SimPlayer — 一款极简风格的 HTML5 网页视频播放器
category: 项目
tags: ["开源", "播放器", "React", "Next.js", "TypeScript"]
summary: SimPlayer 是一款支持 MP4、WebM、OGG 及 HLS（M3U8）的极简 HTML5 网页视频播放器，可嵌入任何网页使用，具备画中画、视频截图、进度记忆、快捷键等丰富功能。
coverImage: https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800
status: published
visibility: public
createdAt: 2026-06-02
---

# SimPlayer 使用与部署指南

> 极简风格的 HTML5 网页视频播放器。一个 URL 就能播，一行代码就能嵌。

**GitHub：** [Eq52/Sim-Player](https://github.com/Eq52/Sim-Player)

---

## 一分钟上手

最快的方式——什么都不用装，什么都不用配：

```
https://你的域名/?url=https://example.com/video.mp4
```

把 `url` 换成任何视频地址，打开就能播。支持 MP4、WebM、OGG 和 HLS（m3u8）。

加个标题也行：

```
https://你的域名/?url=https://example.com/video.mp4&title=我的视频
```

就这样，结束了。

---

## 支持哪些格式

| 格式 | 扩展名          | 说明                                   |
| :--- | :-------------- | :------------------------------------- |
| MP4  | `.mp4`          | 最通用的视频格式，几乎所有浏览器都支持 |
| WebM | `.webm`         | Google 推崇的开放格式，体积小质量好    |
| OGG  | `.ogg` / `.ogv` | 开源多媒体容器格式                     |
| HLS  | `.m3u8`         | 流媒体协议，主流影视站都在用           |

> [!NOTE]
> HLS 播放在桌面端和 Android 上通过 **HLS.js** 实现。在 iOS Safari 上会自动切换为**原生 HLS 引擎**，不需要加载额外的 JS 库，更省电更流畅。遇到网络波动时会自动尝试恢复播放。

---

## 快捷键速查

| 按键          | 功能         |
| :------------ | :----------- |
| `Space` / `K` | 播放 / 暂停  |
| `←`           | 快退 5 秒    |
| `→`           | 快进 5 秒    |
| `↑`           | 音量增加 10% |
| `↓`           | 音量减少 10% |
| `F`           | 切换全屏     |
| `M`           | 关闭弹窗     |
| 双击画面      | 切换全屏     |
| 单击画面      | 播放 / 暂停  |

> [!TIP]
> 暂停时控件会**一直显示**，不会自动隐藏。想截图或调进度的时候可以放心操作，不用急。

---

## 使用方式

### URL 参数播放

最简单的用法。在播放器地址后面加上 `?url=` 参数即可：

| 参数    | 说明                                    | 必填 |
| :------ | :-------------------------------------- | :--: |
| `url`   | 视频文件地址（MP4 / WebM / OGG / M3U8） |  ✅   |
| `title` | 视频标题，显示在播放器顶部              |  ❌   |

示例：

```
https://your-domain.com/?url=https://example.com/video.mp4
https://your-domain.com/?url=https://example.com/video.mp4&title=教程视频
https://your-domain.com/?url=https://cdn.example.com/live/stream.m3u8
```

> [!NOTE]
> 如果你的视频地址本身包含 `&`（比如 B 站链接），不需要手动编码。SimPlayer 会自动解析嵌套 URL。

### iframe 嵌入

想把播放器放进自己的博客、文档站或者影视站？一行 iframe 搞定：

```html
<iframe
  src="https://your-domain.com/?url=https://example.com/video.mp4&title=我的视频"
  width="100%"
  style="aspect-ratio: 16/9; border: none;"
  allowfullscreen
  allow="picture-in-picture"
></iframe>
```

> [!WARNING]
> 如果你需要**画中画**功能，`allow="picture-in-picture"` 属性是必须的。没有这个属性，画中画按钮会被浏览器禁用。

**常用属性说明：**

| 属性                         | 作用               |
| :--------------------------- | :----------------- |
| `allowfullscreen`            | 允许全屏播放       |
| `allow="picture-in-picture"` | 允许画中画浮窗     |
| `width="100%"`               | 播放器宽度占满容器 |
| `style="aspect-ratio: 16/9"` | 保持 16:9 宽高比   |
| `style="border: none;"`      | 去掉边框           |

### React 组件嵌入

如果你用的是 Next.js 项目，可以直接把 SimPlayer 当作 React 组件引入：

```tsx
import VideoPlayer from '@/components/video-player';

<VideoPlayer
  src="https://example.com/video.mp4"
  title="视频标题"
  poster="/cover.jpg"
  fillContainer={false}
  onVideoInfo={(info) => console.log(info)}
  onError={(error) => console.error(error)}
/>
```

**组件属性：**

| 属性            | 类型       | 说明                                 | 必填 |
| :-------------- | :--------- | :----------------------------------- | :--: |
| `src`           | `string`   | 视频地址（MP4 / WebM / OGG / M3U8）  |  ✅   |
| `title`         | `string`   | 视频标题                             |  ❌   |
| `poster`        | `string`   | 封面图 URL，默认 `/poster.png`       |  ❌   |
| `fillContainer` | `boolean`  | 是否填充父容器（禁用 16:9 比例）     |  ❌   |
| `onVideoInfo`   | `function` | 视频元数据回调（分辨率、时长、格式） |  ❌   |
| `onError`       | `function` | 错误回调                             |  ❌   |

---

## 功能详解

### 画中画与全屏

**画中画（Picture-in-Picture）**

点击播放器控件栏的画中画按钮，视频会缩小成浮窗悬浮在屏幕上。你可以继续浏览其他网页，同时看视频。

- 桌面端所有现代浏览器均支持
- 旧版 Safari 通过 WebKit 前缀检测实现兼容
- iframe 嵌入时需要 `allow="picture-in-picture"` 属性

**全屏**

两种方式进入全屏：

- 双击视频画面
- 点击全屏按钮或按 `F`

> [!NOTE]
> 在 iOS Safari 上，由于浏览器限制，全屏仅支持视频元素的原生全屏（即视频撑满整个屏幕，控件仍然可用），不支持容器全屏。SimPlayer 通过 `webkitEnterFullscreen` API 实现了这个能力。

在全屏模式下，右键菜单和对话框（视频参数、快捷键帮助）都可以正常使用。按 Esc 退出对话框后会**自动重新进入全屏**，不会因为操作弹窗而意外退出全屏状态。

### 视频截图

点击截图按钮或通过右键菜单，可以将当前视频帧截取为 PNG 图片并自动下载。

- 文件名格式：`视频标题_时间戳.png`
- 截图瞬间会有屏幕闪烁的视觉反馈，让你明确知道截图成功了
- 自动存档到浏览器默认下载目录

> [!WARNING]
> 受浏览器 CORS 策略限制，跨域视频**无法截图**。遇到这种情况 SimPlayer 会给出降级提示。

### 播放进度记忆

这是我觉得最实用的功能。

SimPlayer 会基于 `localStorage` 自动保存每个视频的观看进度，**每 3 秒存档一次**。下次打开同一个视频时：

1. 自动检测到历史进度
2. 弹出断点续播提示（**5 秒后自动消失**）
3. 你可以选择「跳转到上次位置」或「忽略，从头播放」

关闭浏览器标签页也没关系——进度是持久化存储的。

> [!TIP]
> 想清除所有进度？右键菜单里有「删除播放缓存」选项，一键清空。

### 跨域容错与防盗链

实际使用中，视频资源经常被 CORS 策略和防盗链机制挡住。SimPlayer 内置了两层应对策略：

**跨域容错：**

```
首次尝试 → crossOrigin="anonymous" 加载
    ↓ 失败
自动降级 → 不带 crossOrigin 重新加载
```

**防盗链绕过：**

通过 `no-referrer` 策略绕过基于 Referer 的防盗链检测。比如 B 站视频的 HTTP 959 限制，在 SimPlayer 里可以直接播放。

此外，包含 `&` 等特殊字符的嵌套 URL（B 站链接常见）会被正确解析，不需要手动编码。

### 右键菜单

在播放器区域右键点击，会弹出一个半透明毛玻璃风格的自定义菜单：

| 菜单项       | 功能                                               |
| :----------- | :------------------------------------------------- |
| 截取当前画面 | 截图并下载 PNG                                     |
| 查看视频参数 | 弹窗显示格式、分辨率、时长、进度、速度、音量、缓冲 |
| 快捷键帮助   | 弹窗显示快捷键参考表                               |
| 删除播放缓存 | 清除所有 localStorage 播放记录                     |
| 作者网站     | 跳转至 GitHub 仓库                                 |

菜单自带边界检测，不会弹到屏幕外面。4 秒无操作自动关闭。

---

## 部署教程

SimPlayer 构建后输出纯静态文件到 `out/` 目录，可以部署到**任何**静态托管平台。

### 方式一：下载预编译包直接部署

最省事的方式——不用克隆仓库，不用装 Node.js。

1. 下载 [SimPlayer-v2.0.0-deploy.zip](https://github.com/Eq52/Sim-Player/releases/download/v2.0.0/SimPlayer-v2.0.0-deploy.zip)
2. 解压得到所有静态文件
3. 上传到任意静态托管服务

搞定。

### 方式二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/Eq52/Sim-Player.git
cd Sim-Player

# 安装依赖
npm install

# 构建静态文件（输出到 out/ 目录）
npm run build

# 本地预览
npm run preview
```

构建完成后，`out/` 目录就是全部的部署产物。

### 方式三：Vercel CLI

```bash
npm i -g vercel
cd Sim-Player
vercel --prod
```

### 方式四：Netlify

将 `out/` 目录拖拽上传至 Netlify，或者连接 Git 仓库自动部署。

### 方式五：GitHub Pages

将 `out/` 目录内容推送至 `gh-pages` 分支：

```bash
# 如果你的仓库开启了 GitHub Pages
git subtree push --prefix out origin gh-pages
```

### 方式六：Nginx

```bash
# 先本地构建
npm run build

# 将 out/ 上传到服务器
scp -r out/* user@your-server:/var/www/simplayer/
```

Nginx 配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/simplayer;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> [!IMPORTANT]
> `try_files` 的 `/index.html` 回退是必须的。SimPlayer 是 SPA，所有路由需要由前端处理，否则页面刷新后会白屏。

### 方式七：Docker

```dockerfile
FROM nginx:alpine
COPY out/ /usr/share/nginx/html/
EXPOSE 80
```

```bash
docker build -t simplayer .
docker run -d -p 8080:80 simplayer
```

### 部署方式对比

| 方式         | 难度 | 需要装 Node.js | 自定义域名 |   免费额度   | 适合           |
| :----------- | :--: | :------------: | :--------: | :----------: | :------------- |
| 预编译包上传 |  ⭐   |       ❌        | 取决于平台 |      —       | 所有人         |
| Vercel CLI   |  ⭐   |       ❌        |     ✅      |      有      | 有 Vercel 账号 |
| Netlify      |  ⭐   |       ❌        |     ✅      |   100GB/月   | 所有人         |
| GitHub Pages |  ⭐⭐  |       ✅        |     ✅      |     无限     | 有 GitHub 账号 |
| Nginx        | ⭐⭐⭐  |       ✅        |     ✅      | 取决于服务器 | 有服务器       |
| Docker       | ⭐⭐⭐  |       ✅        |     ✅      | 取决于服务器 | Docker 用户    |

---

## 已知限制

| 限制                | 说明                                          |
| :------------------ | :-------------------------------------------- |
| 跨域视频无法截图    | 浏览器 CORS 策略限制，已做降级提示            |
| iframe 画中画需声明 | 必须添加 `allow="picture-in-picture"` 属性    |
| 进度仅存本地        | 清除浏览器数据会导致进度丢失                  |
| iOS 全屏限制        | Safari 仅支持视频元素原生全屏，不支持容器全屏 |

---

## 常见问题

<details>
<summary>❓ 视频 URL 包含 & 符号怎么办？</summary>


不需要手动编码。SimPlayer 内置了嵌套 URL 解析，会正确处理 `&`、`?` 等特殊字符。直接填原始 URL 就行。
</details>

<details>
<summary>❓ 视频加载不出来怎么办？</summary>


排查顺序：

1. **直接用浏览器打开视频 URL**，确认链接本身是否有效
2. **检查 CORS** — 如果视频服务器不允许跨域，SimPlayer 会自动降级重试（不带 crossOrigin）
3. **检查防盗链** — 如果是 Referer 防盗链，SimPlayer 的 `no-referrer` 策略应该能绕过
4. **HLS 格式** — 确认 m3u8 地址可访问，且 ts 分片链接是绝对路径或可解析的相对路径
   </details>

<details>
<summary>❓ 画中画按钮点了没反应？</summary>


检查以下几点：

1. 确认浏览器支持画中画（大部分现代浏览器都支持）
2. 如果是 iframe 嵌入，确认有 `allow="picture-in-picture"` 属性
3. iOS Safari 目前不支持画中画（系统限制）
   </details>

<details>
<summary>❓ 可以同时播放多个视频吗？</summary>


每个 SimPlayer 实例独立运行，可以在页面中嵌入多个 iframe 或组件实例。但每个实例的进度记忆是按视频 URL 区分的，不会互相冲突。
</details>

<details>
<summary>❓ 怎么自定义播放器的外观？</summary>


SimPlayer 使用 Tailwind CSS 构建样式。如果你是从源码构建，可以直接修改 `src/components/video-player.tsx` 和 `src/app/globals.css` 来自定义外观。后续考虑提供主题配置 API。
</details>

---

## 项目背后的故事

<details>
<summary>📖 为什么叫 SimPlayer？</summary>


Sim = Simple（简单）。我想要的不是一个功能堆砌的巨型播放器，而是一个打开就能用、嵌入一行代码就搞定的轻量播放器。核心播放能力够强，细节功能够贴心，但绝不臃肿。
</details>

<details>
<summary>🤖 这个也是 AI 写的？</summary>


是的，作者是 `Eq52`（我）和 `GLM-5-Turbo`。基于 Next.js 16 + TypeScript + Tailwind CSS 4 构建，29 次提交到 v2.0.0。

这个播放器最初是为 Bismuth Player 服务的内置播放引擎，后来觉得它足够独立、足够好用，就拆出来做成了一个单独的项目。现在既可以独立使用，也可以通过 iframe 或 React 组件集成到任何项目里。

做 SimPlayer 的过程中踩了不少坑——iOS Safari 的 HLS 兼容就是个老大难问题，跨域和防盗链的处理也花了不少心思。但最终的效果我自己是满意的，极简但不简陋。
</details>

<details>
<summary>🔗 和 Bismuth Player 是什么关系？</summary>


SimPlayer 是 Bismuth Player 的内置播放引擎。Bismuth Player 作为一个影视聚合外壳，需要一个好的播放器来承载视频播放——SimPlayer 就是为此而生的。

不过 SimPlayer 也是一个完全独立的播放器项目，不依赖 Bismuth Player，可以单独使用。你不需要影视聚合功能的话，只用 SimPlayer 就够了。
</details>

---

> 觉得好用的话，去 [GitHub](https://github.com/Eq52/Sim-Player) 给个 ⭐ 吧。



*AI生成*
