'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Clock, FileText, ArrowRight, BookOpen, Loader2, ChevronDown, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/store'
import { searchArticles, filterByCategory, filterByTag, paginateArticles, type ArticleData, type ArticlesMeta } from '@/lib/article-utils'
import { siteConfig } from '@/lib/site-config'
import Sidebar from '@/components/blog/Sidebar'

const GRADIENTS = [
  'from-violet-200 via-purple-200 to-indigo-300',
  'from-pink-200 via-rose-200 to-orange-300',
  'from-cyan-200 via-sky-200 to-blue-300',
  'from-emerald-200 via-teal-200 to-green-300',
  'from-amber-200 via-yellow-200 to-lime-300',
  'from-fuchsia-200 via-pink-200 to-rose-300',
]

interface HomeViewProps {
  initialArticles: ArticleData[]
  meta: ArticlesMeta
  heroVideoUrl: string
}

// ---------------------------------------------------------------------------
// Hitokoto — random quote
// ---------------------------------------------------------------------------
function Hitokoto() {
  const [hitokoto, setHitokoto] = useState<string | null>(null)
  const [from, setFrom] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [fadeKey, setFadeKey] = useState(0)

  useEffect(() => {
    let active = true
    const fetchQuote = async () => {
      try {
        const res = await fetch('https://v1.hitokoto.cn/?c=a&c=b&c=d&c=i&c=k', { cache: 'no-store' })
        const data = await res.json()
        if (data.hitokoto && active) {
          setHitokoto(data.hitokoto)
          setFrom(data.from || data.from_who || null)
          setFadeKey((k) => k + 1)
        }
      } catch {
        if (!active) return
        const fallbacks = [
          '生活明朗，万物可爱。',
          '把每一个平凡的日子，过成值得回忆的样子。',
          '保持热爱，奔赴山海。',
          '愿你所有快乐无需假装，此生尽兴赤诚善良。',
          '做一个温暖的人，不求大富大贵，只求生活简单快乐。',
        ]
        const idx = Math.floor(Math.random() * fallbacks.length)
        setHitokoto(fallbacks[idx])
        setFrom('拾光')
        setFadeKey((k) => k + 1)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchQuote()
    const interval = setInterval(fetchQuote, 30000)
    return () => { active = false; clearInterval(interval) }
  }, [])

  if (loading && !hitokoto) {
    return <div className="mb-6 h-12 w-64 animate-pulse rounded bg-white/10" />
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={fadeKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <div className="mx-auto inline-flex max-w-xl flex-col items-center">
          <Quote className="mb-2 h-4 w-4 text-white/40" />
          <p className="text-sm leading-relaxed text-white/70 sm:text-base">{hitokoto}</p>
          {from && <p className="mt-1.5 text-xs text-white/40">—— {from}</p>}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// Wave Canvas — Aurora-style dual sine wave
// ---------------------------------------------------------------------------
function WaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let phase = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      // Wave 1
      ctx.beginPath()
      ctx.moveTo(0, h)
      for (let x = 0; x <= w; x++) {
        const y = Math.sin((x / w) * 4 * Math.PI + phase) * 12 + h * 0.5
        ctx.lineTo(x, y)
      }
      ctx.lineTo(w, h)
      ctx.closePath()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
      ctx.fill()

      // Wave 2
      ctx.beginPath()
      ctx.moveTo(0, h)
      for (let x = 0; x <= w; x++) {
        const y = Math.sin((x / w) * 3 * Math.PI + phase * 1.3 + 1) * 10 + h * 0.6
        ctx.lineTo(x, y)
      }
      ctx.lineTo(w, h)
      ctx.closePath()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.fill()

      phase += 0.015
      animationId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="wave-canvas" style={{ zIndex: 3 }} />
}

// ---------------------------------------------------------------------------
// LazyImage — Claudia-style blur backdrop + fade in
// ---------------------------------------------------------------------------
function LazyImage({
  src,
  alt,
  className,
  gradientClass,
}: {
  src: string
  alt: string
  className?: string
  gradientClass?: string
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = imgRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsInView(true); observer.disconnect() }
      },
      { rootMargin: '200px 0px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={imgRef} className={className}>
      {(!isInView || !isLoaded) && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradientClass || 'from-violet-200 via-purple-200 to-indigo-300'} dark:from-neutral-700 dark:via-neutral-800 dark:to-neutral-900`}
        >
          <FileText className="h-12 w-12 text-white/20" />
        </div>
      )}
      {/* Claudia-style blur backdrop */}
      {isInView && !isLoaded && (
        <img
          src={src}
          alt=""
          className="cover-blur-backdrop opacity-40"
          aria-hidden="true"
        />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out z-[1] ${
            isLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
          } group-hover:scale-110`}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// HomeView
// ---------------------------------------------------------------------------
export default function HomeView({ initialArticles, meta, heroVideoUrl }: HomeViewProps) {
  const { searchQuery, selectedCategory, selectedTag, setSelectedCategory, setSelectedTag, setSearchQuery } = useAppStore()
  const [page, setPage] = useState(1)
  const [bgLoading, setBgLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Track filter key for page reset — state derived during render
  const filterKey = `${selectedCategory || ''}::${selectedTag || ''}::${searchQuery}`
  const [stableFilterKey, setStableFilterKey] = useState(filterKey)
  if (stableFilterKey !== filterKey) { setStableFilterKey(filterKey); setPage(1) }

  // Client-side filtering & search
  const filteredArticles = useMemo(() => {
    let result = initialArticles
    result = filterByCategory(result, selectedCategory)
    result = filterByTag(result, selectedTag)
    result = searchArticles(result, searchQuery)
    return result
  }, [initialArticles, selectedCategory, selectedTag, searchQuery])

  // Pagination
  const paginated = useMemo(
    () => paginateArticles(filteredArticles, page, siteConfig.postsPerPage),
    [filteredArticles, page]
  )

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat === '全部' ? null : cat)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const scrollToArticles = () => {
    document.getElementById('articles-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      {/* ===== Hero Section ===== */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
        {heroVideoUrl && (
          <video
            ref={videoRef} key={heroVideoUrl} src={heroVideoUrl}
            autoPlay muted loop playsInline
            onCanPlay={() => setBgLoading(false)}
            onError={() => setBgLoading(false)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        {/* Bottom gradient fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-[2]" />
        {/* Aurora-style wave */}
        <WaveCanvas />

        {bgLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <Loader2 className="h-8 w-8 animate-spin text-white/60" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: bgLoading ? 0 : 1, scale: bgLoading ? 0.8 : 1 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex justify-center"
          >
            <div className="relative">
              <img src={siteConfig.avatar} alt={siteConfig.author}
                className="h-28 w-28 rounded-full border-2 border-white/40 object-cover shadow-2xl ring-4 ring-white/20 sm:h-32 sm:w-32" />
              <div className="absolute -inset-1 rounded-full bg-white/10 blur-xl" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: bgLoading ? 0 : 1, y: bgLoading ? 20 : 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          >欢迎来到 {siteConfig.name}</motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: bgLoading ? 0 : 1, y: bgLoading ? 20 : 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-2 text-xl font-medium text-white/80 sm:text-2xl"
          >{siteConfig.subtitle}</motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: bgLoading ? 0 : 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            {bgLoading ? null : <Hitokoto />}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: bgLoading ? 0 : 1, y: bgLoading ? 20 : 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-10 max-w-lg text-sm text-white/60 sm:text-base"
          >在这里发现关于技术、生活和创意的精彩文章。</motion.p>

          <motion.button onClick={scrollToArticles}
            initial={{ opacity: 0 }} animate={{ opacity: bgLoading ? 0 : 0.6 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="inline-flex flex-col items-center gap-1 text-white/60 transition-colors hover:text-white"
          >
            <span className="text-xs">浏览文章</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </motion.button>
        </div>
      </section>

      {/* ===== Category Filter ===== */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <button onClick={() => handleCategoryChange('全部')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !selectedCategory
                  ? 'bg-foreground text-background shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >全部</button>
            {meta.categories.map((cat) => (
              <button key={cat} onClick={() => handleCategoryChange(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-foreground text-background shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >{cat}</button>
            ))}
        </motion.div>
        {searchQuery && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              搜索：<span className="font-medium text-foreground">&ldquo;{searchQuery}&rdquo;</span>
              <button onClick={() => setSearchQuery('')} className="ml-2 text-foreground hover:underline">清除</button>
            </p>
          </motion.div>
        )}
        {selectedTag && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              标签筛选：<span className="font-medium text-foreground">&ldquo;{selectedTag}&rdquo;</span>
              <button onClick={() => setSelectedTag(null)} className="ml-2 text-foreground hover:underline">清除</button>
            </p>
          </motion.div>
        )}
      </section>

      {/* ===== Article List + Sidebar ===== */}
      <section id="articles-section" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            {paginated.articles.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">暂无文章</h3>
                <p className="mb-6 max-w-md text-muted-foreground">
                  {searchQuery ? '试试调整搜索词或浏览所有文章' : selectedTag ? `标签「${selectedTag}」下暂无文章` : '该分类下暂无文章'}
                </p>
                <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory(null); setSelectedTag(null) }} className="gap-2">
                  <FileText className="h-4 w-4" />浏览所有文章
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mb-6 text-sm text-muted-foreground">共 {paginated.total} 篇文章</motion.p>

                <div className="space-y-5">
                  <AnimatePresence mode="popLayout">
                    {paginated.articles.map((article, idx) => (
                      <motion.div
                        key={article.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: idx * 0.05, layout: { duration: 0.3 } }}
                      >
                        <Link href={`/article/${article.id}`}>
                          <Card className="group cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-black/[0.04]">
                            {/* Claudia-style card: cover + content inline */}
                            <div className="flex flex-col sm:flex-row">
                              {/* Cover with blur backdrop */}
                              <div className="relative h-48 w-full overflow-hidden sm:h-auto sm:w-64 shrink-0">
                                {article.coverImage ? (
                                  <LazyImage
                                    src={article.coverImage}
                                    alt={article.title}
                                    className="absolute inset-0"
                                    gradientClass={GRADIENTS[idx % GRADIENTS.length]}
                                  />
                                ) : (
                                  <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} dark:from-neutral-700 dark:via-neutral-800 dark:to-neutral-900 sm:min-h-[160px]`}>
                                    <FileText className="h-12 w-12 text-white/30" />
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <CardContent className="flex-1 p-5">
                                {/* Claudia-style orange tags */}
                                <div className="mb-2 flex flex-wrap gap-1.5">
                                  {article.category && (
                                    <span className="tag-orange">{article.category}</span>
                                  )}
                                </div>

                                <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-snug tracking-tight transition-colors opacity-70 group-hover:opacity-100">
                                  {article.title}
                                </h3>

                                {article.summary && (
                                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                                    {article.summary}
                                  </p>
                                )}

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                                      {siteConfig.author[0]?.toUpperCase() || '匿'}
                                    </div>
                                    <span className="font-medium text-foreground/80">{siteConfig.author}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />{formatDate(article.createdAt)}
                                    </span>
                                  </div>
                                </div>

                                {/* Claudia-style read more button */}
                                <div className="mt-4">
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                                    阅读全文 <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                  </span>
                                </div>
                              </CardContent>
                            </div>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {paginated.totalPages > 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-10 flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="gap-1">上一页</Button>
                    {Array.from({ length: Math.min(paginated.totalPages, 5) }, (_, i) => {
                      let pageNum: number
                      if (paginated.totalPages <= 5) pageNum = i + 1
                      else if (page <= 3) pageNum = i + 1
                      else if (page >= paginated.totalPages - 2) pageNum = paginated.totalPages - 4 + i
                      else pageNum = page - 2 + i
                      return (
                        <Button key={pageNum} variant={page === pageNum ? 'default' : 'outline'} size="sm" onClick={() => setPage(pageNum)}
                          className={page === pageNum ? 'bg-foreground text-background hover:bg-foreground/90' : ''}>
                          {pageNum}
                        </Button>
                      )
                    })}
                    <Button variant="outline" size="sm" disabled={page >= paginated.totalPages} onClick={() => setPage((p) => p + 1)} className="gap-1">
                      下一页<ArrowRight className="h-3 w-3" />
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <Sidebar articles={initialArticles} meta={meta} />
        </div>
      </section>
    </div>
  )
}
