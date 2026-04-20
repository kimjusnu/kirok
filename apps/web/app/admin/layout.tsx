import Link from 'next/link'
import { LogoutButton } from './LogoutButton'
import { getAdminBasePath } from '@/lib/admin-path'

export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const base = getAdminBasePath()
  return (
    <div>
      <AdminNav base={base} />
      {children}
    </div>
  )
}

function AdminNav({ base }: { base: string }) {
  return (
    <nav className="border-b border-[var(--line)] bg-[var(--line-soft)]">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          <Link href={`${base}/`} className="font-semibold tracking-tight">
            admin
          </Link>
          <Link
            href={`${base}/sessions`}
            className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            Sessions
          </Link>
          <Link
            href={`${base}/coupons`}
            className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            Coupons
          </Link>
        </div>
        <LogoutButton />
      </div>
    </nav>
  )
}
