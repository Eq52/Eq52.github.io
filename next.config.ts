import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出 — 生成纯 HTML/CSS/JS 文件，适用于 GitHub Pages
  output: "export",

  // GitHub Pages 部署时需要设置 basePath
  // 如果部署到 https://username.github.io/，basePath 为空
  // 如果部署到 https://username.github.io/repo-name/，basePath 为 '/repo-name'
  // basePath: process.env.NODE_ENV === 'production' ? '/EricBlog' : '',

  // 禁用图片优化（静态导出不支持 Next.js 图片优化服务）
  images: {
    unoptimized: true,
  },

  // 关闭 trailingSlash（GitHub Pages 支持）
  trailingSlash: false,

  typescript: {
    ignoreBuildErrors: true,
  },

  reactStrictMode: false,
};

export default nextConfig;
