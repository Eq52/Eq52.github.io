/**
 * 文章数据类型和纯数据处理函数
 * 此文件不依赖 Node.js fs 模块，可安全在客户端组件中导入
 */

import { pinyin } from 'pinyin-pro'

// ---------------------------------------------------------------------------
// 类型定义
// ---------------------------------------------------------------------------

export interface ArticleData {
  id: string           // slug（文件名去掉 .md）
  title: string
  content: string       // Markdown 正文
  summary: string | null
  category: string | null
  tags: string[]
  coverImage: string | null
  status: string        // published | draft
  visibility: string   // public | private
  createdAt: string
  updatedAt: string | null
}

export interface ArticlesMeta {
  categories: string[]
  tags: string[]
  total: number
}

// ---------------------------------------------------------------------------
// 拼音工具
// ---------------------------------------------------------------------------

/**
 * 将字符串转为拼音（不带声调，空格分隔）
 * 例："你好世界" → "ni hao shi jie"
 * 例："hello" → "hello"（非中文保持原样）
 */
function toPinyin(str: string): string {
  return pinyin(str, { toneType: 'none', separator: ' ', type: 'array' }).join(' ').toLowerCase()
}

/**
 * 生成搜索用文本：原文 + 拼音 + 小写，用于模糊匹配
 * 同时拼接标签和分类信息
 */
function buildSearchableText(article: ArticleData): string {
  const parts = [
    article.title,
    article.summary || '',
    article.content,
    article.category || '',
    ...article.tags,
  ]
  const raw = parts.join(' ').toLowerCase()
  const py = toPinyin(parts.join(' '))
  return `${raw} ${py}`
}

// ---------------------------------------------------------------------------
// 纯数据处理函数（可在客户端使用）
// ---------------------------------------------------------------------------

/**
 * 客户端搜索：在文章标题、摘要、内容、标签、分类中搜索关键词
 * 支持中文、拼音、英文
 */
export function searchArticles(articles: ArticleData[], query: string): ArticleData[] {
  if (!query.trim()) return articles
  const q = query.toLowerCase().trim()
  const qPinyin = toPinyin(query)

  return articles.filter((a) => {
    const searchable = buildSearchableText(a)

    // 原文匹配（中文/英文直接匹配）
    if (searchable.includes(q)) return true

    // 拼音匹配：搜索词的拼音也要匹配文章内容的拼音
    if (qPinyin && qPinyin !== q) {
      return searchable.includes(qPinyin)
    }

    return false
  })
}

/**
 * 按分类筛选
 */
export function filterByCategory(articles: ArticleData[], category: string | null): ArticleData[] {
  if (!category) return articles
  return articles.filter(a => a.category === category)
}

/**
 * 按标签筛选
 */
export function filterByTag(articles: ArticleData[], tag: string | null): ArticleData[] {
  if (!tag) return articles
  return articles.filter(a => a.tags.includes(tag))
}

/**
 * 客户端分页
 */
export function paginateArticles(
  articles: ArticleData[],
  page: number,
  limit: number
): { articles: ArticleData[]; totalPages: number; total: number } {
  const total = articles.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  return {
    articles: articles.slice(start, start + limit),
    totalPages,
    total,
  }
}
