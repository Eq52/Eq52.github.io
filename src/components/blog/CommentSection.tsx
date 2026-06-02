'use client'

import { useEffect, useRef, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { siteConfig } from '@/lib/site-config'

interface CommentSectionProps {
  articleId: string
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!siteConfig.giscus.enabled) return
    if (loaded) return

    // Inject the Giscus script
    const scriptEl = document.createElement('script')
    scriptEl.src = 'https://giscus.app/client.js'
    scriptEl.async = true
    scriptEl.crossOrigin = 'anonymous'
    scriptEl.setAttribute('data-repo', siteConfig.giscus.repo)
    scriptEl.setAttribute('data-repo-id', siteConfig.giscus.repoId)
    scriptEl.setAttribute('data-category', siteConfig.giscus.category)
    scriptEl.setAttribute('data-category-id', siteConfig.giscus.categoryId)
    scriptEl.setAttribute('data-mapping', 'pathname')
    scriptEl.setAttribute('data-strict', '0')
    scriptEl.setAttribute('data-reactions-enabled', siteConfig.giscus.reactionsEnabled)
    scriptEl.setAttribute('data-emit-metadata', siteConfig.giscus.emitMetadata)
    scriptEl.setAttribute('data-input-position', 'top')
    scriptEl.setAttribute('data-theme', 'preferred_color_scheme')
    scriptEl.setAttribute('data-lang', siteConfig.giscus.lang)
    scriptEl.setAttribute('data-loading', 'lazy')

    containerRef.current?.appendChild(scriptEl)

    // Mark as loaded once the iframe sends the first message
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://giscus.app') return
      if (!(typeof event.data === 'object' && event.data)) return
      if (event.data.giscus) {
        setLoaded(true)
        window.removeEventListener('message', handleMessage)
      }
    }
    window.addEventListener('message', handleMessage)

    // Fallback: consider loaded after a short delay
    const fallback = setTimeout(() => setLoaded(true), 5000)

    return () => {
      clearTimeout(fallback)
      window.removeEventListener('message', handleMessage)
    }
  }, [articleId, loaded])

  if (!siteConfig.giscus.enabled) return null

  return (
    <section>
      <h2 className="mb-6 text-xl font-bold">评论</h2>

      {/* Loading skeleton while Giscus loads */}
      {!loaded && (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      <div ref={containerRef} />
    </section>
  )
}
