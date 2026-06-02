import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="mb-4 text-8xl font-bold text-muted-foreground/20">404</h1>
      <h2 className="mb-6 text-2xl font-semibold">页面未找到</h2>
      <p className="mb-8 text-muted-foreground">
        你访问的页面不存在，可能已被移动或删除。
      </p>
      <Link href="/">
        <Button className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Button>
      </Link>
    </div>
  )
}
