/**
 * 构建时数据加载层
 * 在 Next.js 静态导出时，从 content/*.md 文件读取所有文章数据
 * ⚠️ 此文件依赖 Node.js fs 模块，仅可在服务端/构建时使用
 * 客户端组件请使用 ./article-utils.ts 中的纯函数
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs'
import path from 'path'
import { parseMdFile, type MdFrontmatter } from './md-files'
import type { ArticleData, ArticlesMeta } from './article-utils'

// ---------------------------------------------------------------------------
// 内容目录
// ---------------------------------------------------------------------------

const CONTENT_DIR = path.join(process.cwd(), 'content')

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

function fileNameToSlug(fileName: string): string {
  return fileName.replace(/\.md$/, '')
}

/** 从 frontmatter 中提取文章数据 */
function frontmatterToArticle(
  slug: string,
  frontmatter: MdFrontmatter,
  content: string,
  birthtime: Date,
  mtime: Date
): ArticleData {
  return {
    id: slug,
    title: frontmatter.title || slug,
    content,
    summary: frontmatter.summary || null,
    category: frontmatter.category || null,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    coverImage: frontmatter.coverImage || null,
    status: frontmatter.status || 'published',
    visibility: frontmatter.visibility || 'public',
    createdAt: frontmatter.createdAt || birthtime.toISOString(),
    updatedAt: frontmatter.updatedAt || mtime.toISOString(),
  }
}

// ---------------------------------------------------------------------------
// 核心函数（仅服务端/构建时调用）
// ---------------------------------------------------------------------------

/**
 * 获取所有已发布的文章（构建时使用）
 * 只返回 status === 'published' && visibility === 'public' 的文章
 */
export function getAllPublishedArticles(): ArticleData[] {
  if (!existsSync(CONTENT_DIR)) return []

  const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'))
  const articles: ArticleData[] = []

  for (const fileName of files) {
    try {
      const filePath = path.join(CONTENT_DIR, fileName)
      const fileContent = readFileSync(filePath, 'utf-8')
      const { frontmatter, content } = parseMdFile(fileContent)
      const slug = fileNameToSlug(fileName)
      const stat = statSync(filePath)

      // 只包含已发布且公开的文章
      if (frontmatter.status === 'draft') continue
      if (frontmatter.visibility === 'private') continue

      articles.push(frontmatterToArticle(slug, frontmatter, content, stat.birthtime, stat.mtime))
    } catch {
      // 跳过无法解析的文件
    }
  }

  // 按创建时间倒序排列
  articles.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })

  return articles
}

/**
 * 根据 slug 获取单篇文章
 */
export function getArticleById(id: string): ArticleData | null {
  const filePath = path.join(CONTENT_DIR, `${id}.md`)
  if (!existsSync(filePath)) return null

  try {
    const fileContent = readFileSync(filePath, 'utf-8')
    const { frontmatter, content } = parseMdFile(fileContent)
    const stat = statSync(filePath)
    return frontmatterToArticle(id, frontmatter, content, stat.birthtime, stat.mtime)
  } catch {
    return null
  }
}

/**
 * 获取所有文章的 slug 列表（用于 generateStaticParams）
 */
export function getAllArticleIds(): string[] {
  if (!existsSync(CONTENT_DIR)) return []
  return readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => fileNameToSlug(f))
}

/**
 * 从文章列表中提取分类和标签元数据
 */
export function getArticlesMeta(articles: ArticleData[]): ArticlesMeta {
  const categorySet = new Set<string>()
  const tagSet = new Set<string>()

  for (const article of articles) {
    if (article.category) categorySet.add(article.category)
    for (const tag of article.tags) tagSet.add(tag)
  }

  return {
    categories: Array.from(categorySet).sort(),
    tags: Array.from(tagSet).sort(),
    total: articles.length,
  }
}
