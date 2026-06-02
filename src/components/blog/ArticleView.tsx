'use client'

import { useEffect, useState, useMemo, Children, isValidElement, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  Tag,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { Separator } from '@/components/ui/separator'

import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

import { siteConfig } from '@/lib/site-config'
import { type ArticleData } from '@/lib/article-utils'
import CommentSection from './CommentSection'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeRaw from 'rehype-raw'

interface ArticleViewProps {
  article: ArticleData
}

interface TocItem {
  id: string
  text: string
  level: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** GitHub Alert types mapping */
const GITHUB_ALERTS: Record<string, string> = {
  NOTE: 'github-alert-note',
  TIP: 'github-alert-tip',
  IMPORTANT: 'github-alert-important',
  WARNING: 'github-alert-warning',
  CAUTION: 'github-alert-caution',
}

/** Detect GitHub Alert syntax (`> [!TYPE]`) in blockquote children. */
function detectAlert(children: ReactNode): { type: string; rest: ReactNode[] } | null {
  const arr = Children.toArray(children)
  if (arr.length === 0) return null
  const first = arr[0]
  if (!isValidElement(first)) return null
  const pKids = Children.toArray(first.props.children)
  if (pKids.length === 0) return null
  const text = typeof pKids[0] === 'string' ? (pKids[0] as string) : ''
  const match = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/i)
  if (!match) return null
  return { type: match[1].toUpperCase(), rest: arr.slice(1) }
}

/** Extract h2 / h3 headings from raw markdown (sequential IDs). */
function extractHeadings(content: string): TocItem[] {
  const lines = content.split('\n')
  const headings: TocItem[] = []
  let idx = 0

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/)
    if (match) {
      idx++
      const level = match[1].length
      const text = match[2]
        .replace(/[#*`~\[\]()>]/g, '')      // strip inline markdown
        .replace(/\{.*?\}/g, '')              // strip attribute braces
        .trim()
      if (text) {
        headings.push({ id: `heading-${idx}`, text, level })
      }
    }
  }

  return headings
}

/** Calculate estimated reading time (minutes). ~400 CJK chars / ~200 EN words per min. */
function calculateReadingTime(content: string): number {
  // Remove front-matter / code fences so we only count prose
  const prose = content
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/```[\s\S]*?```/g, '')
  const chineseChars = (prose.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length
  const englishWords = (
    prose.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ').match(/[a-zA-Z]+/g) || []
  ).length
  return Math.max(1, Math.ceil(chineseChars / 400 + englishWords / 200))
}

// ---------------------------------------------------------------------------
// CodeBlock – syntax-highlighted block with a copy button
// ---------------------------------------------------------------------------

function CodeBlock({ language, children }: { language: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const { theme, resolvedTheme: _resolvedTheme } = useTheme()
  const resolvedTheme = _resolvedTheme === 'dark' ? 'dark' : 'light'
  const codeText = String(children).replace(/\n$/, '')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: '复制失败', variant: 'destructive' })
    }
  }

  return (
    <div className={cn(
      'group/code relative my-8 overflow-hidden rounded-xl border border-border/60 shadow-sm',
      resolvedTheme === 'dark' ? 'bg-neutral-900/50' : 'bg-neutral-50'
    )}>
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">{language}</span>
        <button
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors',
            copied
              ? 'text-green-600 dark:text-green-400'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
          aria-label="复制代码"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              已复制!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              复制
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={resolvedTheme === 'dark' ? oneDark : oneLight}
        language={language}
        PreTag="div"
        className="!m-0 !rounded-none text-[0.8125rem] leading-[1.7]"
        customStyle={{ padding: '1em 1.25em', background: 'transparent' }}
      >
        {codeText}
      </SyntaxHighlighter>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TableOfContents – sticky sidebar with scroll-tracking highlight
// ---------------------------------------------------------------------------

function TableOfContents({ headings }: { headings: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id || '')

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the top-most heading that is currently intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        // Detection zone: 80 px below viewport top → 40 % from viewport bottom
        rootMargin: '-80px 0px -40% 0px',
        threshold: 0,
      },
    )

    // Delay slightly so rendered heading elements exist in the DOM
    const timer = setTimeout(() => {
      headings.forEach(({ id }) => {
        const el = document.getElementById(id)
        if (el) observer.observe(el)
      })
    }, 150)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [headings])

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 88
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  if (headings.length === 0) return null

  return (
    <nav className="sticky top-24" aria-label="目录">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        目录
      </p>
      <ul className="space-y-0.5">
        {headings.map((h) => (
          <li key={h.id}>
            <button
              onClick={() => handleClick(h.id)}
              className={cn(
                'block w-full text-left border-l-2 text-[13px] leading-relaxed transition-colors',
                h.level === 3 ? 'pl-6' : 'pl-4',
                activeId === h.id
                  ? 'border-foreground font-medium text-foreground'
                  : 'border-transparent text-muted-foreground/70 hover:border-muted-foreground/30 hover:text-muted-foreground',
              )}
            >
              <span className="line-clamp-2">{h.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// ArticleView – main component
// ---------------------------------------------------------------------------

export default function ArticleView({ article }: ArticleViewProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({ title: '已复制链接！' })
      } catch {
        toast({ title: '复制失败', variant: 'destructive' })
      }
    }
  }

  // ---- derived data ----
  const headings = useMemo(
    () => extractHeadings(article.content),
    [article.content],
  )

  const readingTime = useMemo(
    () => calculateReadingTime(article.content),
    [article.content],
  )

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const hasToc = headings.length > 0

  // Sequential heading counter – recreated every render so IDs match `headings`
  const headingCounter = { current: 0 }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const articleMeta = (
    <>
      {/* Back Button */}
      <Link href="/">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Button>
      </Link>

      {/* Article Header */}
      <header className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {article.category && (
            <span className="tag-orange">{article.category}</span>
          )}
        </div>

        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {article.title}
        </h1>

        {article.summary && (
          <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
            {article.summary}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
              {siteConfig.author.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-foreground">{siteConfig.author}</p>
            </div>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(article.createdAt)}
          </span>
          {readingTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readingTime} 分钟阅读
            </span>
          )}
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {article.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="gap-1 text-xs font-normal">
                <Tag className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Cover Image */}
      {article.coverImage && (
        <div className="mb-8 overflow-hidden rounded-xl">
          <img
            src={article.coverImage}
            alt={article.title}
            loading="lazy"
            className="w-full object-cover transition-opacity duration-700 ease-out"
            onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1' }}
            style={{ opacity: 0 }}
          />
        </div>
      )}

      {/* Article Content */}
      <article className="article-content mb-10">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeRaw,
            rehypeAutolinkHeadings,
            [
              rehypeSanitize,
              {
                attributes: {
                  '*': ['className', 'id'],
                  a: ['href', 'target', 'rel', 'dataFootnoteRef', 'dataFootnoteBackref', 'ariaDescribedby', 'ariaLabel'],
                  img: ['src', 'alt', 'loading', 'className'],
                  code: ['className'],
                  pre: ['className'],
                  section: ['dataFootnotes'],
                },
              },
            ],
          ]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              const isInline = !match
              if (isInline) {
                return (
                  <code
                    className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                )
              }
              return (
                <CodeBlock language={match[1]}>{children}</CodeBlock>
              )
            },
            h1: ({ children }) => (
              <h1 className="group mb-8 mt-12 text-3xl font-bold tracking-tight sm:text-4xl">
                {children}
              </h1>
            ),
            h2: ({ children, className, id, ...props }) => {
              // Preserve footnotes heading (sr-only, id=footnote-label)
              if (typeof className === 'string' && className.includes('sr-only')) {
                return <h2 id={id} className={className} {...props}>{children}</h2>
              }
              headingCounter.current++
              const hId = `heading-${headingCounter.current}`
              return (
                <h2
                  id={hId}
                  className="scroll-mt-20 mb-5 mt-10 border-b-2 border-border/60 pb-3 text-2xl font-bold tracking-tight sm:text-3xl"
                >
                  {children}
                </h2>
              )
            },
            h3: ({ children }) => {
              headingCounter.current++
              const id = `heading-${headingCounter.current}`
              return (
                <h3
                  id={id}
                  className="scroll-mt-20 mb-4 mt-8 text-xl font-semibold tracking-tight"
                >
                  {children}
                </h3>
              )
            },
            h4: ({ children }) => (
              <h4 className="mb-3 mt-6 text-lg font-semibold text-foreground/80">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="mb-5 text-[1.0625rem] leading-[1.85] text-foreground/85">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="mb-5 space-y-2.5 pl-6 text-[1.0625rem] leading-[1.85] text-foreground/85 marker:text-foreground/40">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-5 list-decimal space-y-2.5 pl-6 text-[1.0625rem] leading-[1.85] text-foreground/85 marker:text-foreground/40">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-[1.85]">{children}</li>
            ),
            blockquote: ({ children }) => {
              const alert = detectAlert(children)
              if (alert) {
                const cls = GITHUB_ALERTS[alert.type]
                if (cls) {
                  return (
                    <div className={cn('github-alert', cls)}>
                      <p className="github-alert-title">{alert.type}</p>
                      {alert.rest.length > 0 && (
                        <div className="github-alert-body">{alert.rest}</div>
                      )}
                    </div>
                  )
                }
              }
              return (
                <blockquote className="my-6 border-l-4 border-foreground/20 bg-muted/40 py-4 pl-5 pr-5 italic text-muted-foreground [&>p]:text-base">
                  {children}
                </blockquote>
              )
            },
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground/90 underline decoration-foreground/20 underline-offset-4 transition-all hover:decoration-foreground/60 hover:text-foreground"
              >
                {children}
              </a>
            ),
            img: ({ src, alt }) => (
              <img src={src} alt={alt} className="my-8 rounded-xl shadow-sm" loading="lazy" />
            ),
            hr: () => <Separator className="my-10" />,
            table: ({ children }) => (
              <div className="my-6 overflow-x-auto rounded-xl border border-border/60 shadow-sm">
                <table className="w-full text-sm">{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border-b border-border/60 bg-muted/50 px-4 py-3 text-left text-sm font-semibold text-foreground">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border-b border-border/30 px-4 py-3 text-sm">{children}</td>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="text-foreground/75">{children}</em>
            ),
            del: ({ children }) => (
              <del className="text-muted-foreground/60 line-through decoration-foreground/25">{children}</del>
            ),
            kbd: ({ children }) => (
              <kbd className="rounded border border-border/50 bg-muted/50 px-1.5 py-0.5 text-xs font-mono shadow-[0_1px_0_oklch(0.8_0_0)] dark:shadow-[0_1px_0_oklch(0.3_0_0)]">{children}</kbd>
            ),
            sup: ({ children, ...props }) => (
              <sup className="text-[0.7em] text-muted-foreground/50" {...props}>{children}</sup>
            ),
            sub: ({ children, ...props }) => (
              <sub className="text-[0.7em] text-muted-foreground/50" {...props}>{children}</sub>
            ),
            input: ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
              if (props.type === 'checkbox') {
                return (
                  <input
                    type="checkbox"
                    checked={props.checked}
                    disabled={props.disabled}
                    className="task-list-checkbox"
                    readOnly
                  />
                )
              }
              return <input className={className} {...props} />
            },
            details: ({ children }) => (
              <details className="my-6 rounded-xl border border-border/50 bg-card shadow-sm transition-colors open:border-primary/20">
                {children}
              </details>
            ),
            summary: ({ children }) => (
              <summary className="cursor-pointer px-4 py-3 font-medium text-foreground/80 select-none transition-colors hover:text-foreground hover:bg-muted/30">
                {children}
              </summary>
            ),
          }}
        >
          {article.content}
        </ReactMarkdown>
      </article>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 py-4">
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
          {copied ? (
            <>
              <Check className="h-4 w-4 text-foreground" />
              已复制
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              复制链接
            </>
          )}
        </Button>
      </div>

      <Separator className="my-8" />

      {/* Comments */}
      <CommentSection articleId={article.id} />
    </>
  )

  // ---------------------------------------------------------------------------
  // Layout: single-column (no TOC) or two-column (with TOC)
  // ---------------------------------------------------------------------------

  if (!hasToc) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8"
      >
        {articleMeta}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:max-w-5xl"
    >
      <div className="flex gap-8">
        {/* Article content */}
        <div className="min-w-0 max-w-3xl flex-1">{articleMeta}</div>

        {/* TOC sidebar – sticky, desktop only */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <TableOfContents headings={headings} />
        </aside>
      </div>
    </motion.div>
  )
}
