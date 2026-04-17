import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '정밀 기질검사',
  description: '논문 기반 정확한 기질검사. 원래 9,900원 → 특가 1,200원',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
