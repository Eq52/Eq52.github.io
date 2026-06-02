import { notFound } from 'next/navigation'
import { getArticleById, getAllArticleIds } from '@/lib/build-data'
import Navbar from '@/components/blog/Navbar'
import Footer from '@/components/blog/Footer'
import ArticleView from '@/components/blog/ArticleView'

export function generateStaticParams() {
  return getAllArticleIds().map((id) => ({ id }))
}

export function generateMetadata({ params }: { params: { id: string } }) {
  // In Next.js 16, params is a Promise
  // We use a synchronous helper since we're at build time
  return {
    title: `文章`,
    description: `阅读文章`,
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const article = getArticleById(id)

  if (!article) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="h-16" />
      <main className="flex-1">
        <ArticleView article={article} />
      </main>
      <Footer />
    </div>
  )
}
