/**
 * 站点配置 — 集中管理所有可自定义的站点信息
 * GitHub Pages 部署时，修改此文件即可自定义博客
 */

export const siteConfig = {
  // 站点基本信息
  name: 'Eric Blog',
  description: '记录思想，分享知识',
  author: 'Eric',
  subtitle: '探索思想，分享知识',
  bio: '记录技术、生活与创意',

  // 社交链接
  github: 'https://github.com/Eq52',
  email: '#',

  // 资源路径
  avatar: '/avatar.jpg',
  logo: '/logo.svg',

  // 建站日期（用于运行天数计数器）
  siteCreatedAt: '2026-06-02',

  // 首页视频背景 URL（留空则使用纯色渐变背景）
  heroVideoUrl: 'https://raw.githubusercontent.com/Eq52/Eq52.github.io/bbbee79a9e8ef6856ce76adb4154c30e735a77d7/vid/18397660980104576.mp4',

  // 侧边栏打字机文案
  typingTexts: [
    '记录技术，分享知识',
    '探索前沿，持续学习',
    '热爱编程，热爱生活',
    'Code is poetry',
  ],

  // Giscus 评论配置（基于 GitHub Discussions）
  // 请到 https://giscus.app 获取以下配置
  giscus: {
    enabled: true, // 设为 false 可关闭评论
    repo: 'Eq52/Eq52.github.io', // GitHub 仓库
    repoId: 'R_kgDOO_f29g', // 仓库 ID
    category: 'Announcements', // Discussion 分类
    categoryId: 'DIC_kwDOO_f29s4C-WMa', // 分类 ID
    mapping: 'pathname', // 映射方式
    lang: 'zh-CN', // 语言
    reactionsEnabled: '1', // 启用反应
    emitMetadata: '0', // 不发送元数据
  },

  // 每页文章数
  postsPerPage: 12,
}

export type SiteConfig = typeof siteConfig
