import Link from 'next/link'
import { LogoutButton } from './LogoutButton'

export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AdminNav />
      {children}
    </div>
  )
}

function AdminNav() {
  return (
    <nav className="border-b border-[var(--line)] bg-[var(--line-soft)]">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-semibold tracking-tight">
            admin
          </Link>
          <Link
            href="/admin/sessions"
            className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            Sessions
          </Link>
          <Link
            href="/admin/coupons"
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
