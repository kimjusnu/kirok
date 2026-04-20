import Link from 'next/link'
import { NewCouponForm } from './NewCouponForm'
import { getAdminBasePath } from '@/lib/admin-path'

export const dynamic = 'force-dynamic'

export default function NewCouponPage() {
  const base = getAdminBasePath()
  return (
    <main>
      <div className="max-w-xl mx-auto px-6 py-12">
        <Link
          href={`${base}/coupons`}
          className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)] link-underline"
        >
          ← Coupons
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">새 쿠폰</h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          코드는 영문 대문자·숫자·_·− 조합. 한번 발급하면 코드 자체는 수정할 수 없어요.
        </p>
        <div className="mt-10">
          <NewCouponForm />
        </div>
      </div>
    </main>
  )
}
