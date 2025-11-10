import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/providers'
import SiteHeader from '@/components/site-header'

export const metadata: Metadata = {
  title: 'ToolScout 项目框架',
  description: 'Next.js + Supabase 项目骨架（功能暂未实现）',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='zh-CN'>
      <body className='antialiased'>
        <Providers>
          <SiteHeader />
          <div className='mx-auto max-w-5xl px-6'>{children}</div>
        </Providers>
      </body>
    </html>
  )
}
