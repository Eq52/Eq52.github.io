import Navbar from '@/components/blog/Navbar'
import Footer from '@/components/blog/Footer'
import HomeView from '@/components/blog/HomeView'
import { getAllPublishedArticles, getArticlesMeta } from '@/lib/build-data'
import { siteConfig } from '@/lib/site-config'

export default function Home() {
  const allArticles = getAllPublishedArticles()
  const meta = getArticlesMeta(allArticles)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="h-16" />
      <main className="flex-1">
        <HomeView
          initialArticles={allArticles}
          meta={meta}
          heroVideoUrl={siteConfig.heroVideoUrl}
        />
      </main>
      <Footer meta={meta} />
    </div>
  )
}
