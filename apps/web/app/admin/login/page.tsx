import { LoginForm } from './LoginForm'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  return (
    <main>
      <div className="max-w-md mx-auto px-6 py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          kirok · admin
        </p>
        <h1 className="mt-4 text-2xl font-semibold">로그인</h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          운영자 비밀번호를 입력해 주세요.
        </p>
        <div className="mt-8">
          <LoginForm next={searchParams.next ?? '/admin'} />
        </div>
      </div>
    </main>
  )
}
