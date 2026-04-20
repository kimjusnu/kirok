'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Gender = 'male' | 'female' | 'other' | 'prefer_not'
type AgeRange = 'teens' | '20s' | '30s' | '40s' | '50s' | '60_plus' | 'prefer_not'

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other', label: '기타' },
  { value: 'prefer_not', label: '미응답' },
]

const AGE_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: 'teens', label: '10대' },
  { value: '20s', label: '20대' },
  { value: '30s', label: '30대' },
  { value: '40s', label: '40대' },
  { value: '50s', label: '50대' },
  { value: '60_plus', label: '60대+' },
  { value: 'prefer_not', label: '미응답' },
]

export function ConsentForm({
  slug,
  nameKo,
  estimatedMinutes,
  itemCount,
}: {
  slug: string
  nameKo: string
  estimatedMinutes: number
  itemCount: number
}) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [gender, setGender] = useState<Gender | null>(null)
  const [ageRange, setAgeRange] = useState<AgeRange | null>(null)
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    displayName.trim().length > 0 &&
    gender != null &&
    ageRange != null &&
    consent &&
    !submitting

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testSlug: slug,
          profile: {
            displayName: displayName.trim(),
            gender,
            ageRange,
          },
        }),
      })
      // 서버가 빈 body로 500을 반환하는 엣지 케이스(런타임 크래시·Vercel
      // 타임아웃 등)에서도 res.json()이 "Unexpected end of JSON input"으로
      // 터지지 않도록 방어. JSON 파싱 실패 시 HTTP 상태 기반 메시지로 폴백.
      const raw = await res.text()
      let body: {
        sessionId?: string
        accessToken?: string
        error?: string
        stage?: string
        code?: string
        message?: string
      } = {}
      if (raw) {
        try {
          body = JSON.parse(raw)
        } catch {
          body = { error: `HTTP_${res.status}`, message: raw.slice(0, 120) }
        }
      } else {
        body = { error: `HTTP_${res.status}` }
      }
      if (!res.ok || !body.sessionId || !body.accessToken) {
        const detail = body.stage
          ? ` (${body.stage}${body.code ? `:${body.code}` : ''})`
          : ''
        throw new Error(
          `${body.error ?? 'session_create_failed'}${detail}`,
        )
      }
      router.push(`/test/${slug}/run?sid=${body.sessionId}&at=${body.accessToken}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'session_create_failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-xl mx-auto px-6 py-12 sm:py-16">
      <header>
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Begin · {nameKo}
        </p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
          시작 전 몇 가지만
        </h1>
        <span className="block w-12 h-px bg-[var(--ink)] mt-6" aria-hidden />
        <p className="mt-6 prose-editorial text-[15px]">
          리포트에 표시될 호칭과, 통계 분석에 쓸 기본 정보 2개입니다. 실명은 묻지
          않아요. 약 {estimatedMinutes}분, {itemCount}문항.
        </p>
      </header>

      <section className="mt-12">
        <label className="block">
          <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            Nickname · 닉네임
          </span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
            placeholder="리포트에 표시될 호칭"
            className="mt-3 w-full px-0 py-3 border-0 border-b border-[var(--line)] focus:border-[var(--ink)] focus:ring-0 outline-none text-[18px] bg-transparent"
            required
          />
        </label>
      </section>

      <section className="mt-10">
        <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Gender · 성별
        </div>
        <div
          className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2"
          role="radiogroup"
          aria-label="성별"
        >
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={gender === opt.value}
              onClick={() => setGender(opt.value)}
              className={`py-3 text-sm border transition ${
                gender === opt.value
                  ? 'border-[var(--ink)] bg-[var(--ink)] text-white'
                  : 'border-[var(--line)] hover:border-[var(--ink-muted)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Age · 나이대
        </div>
        <div
          className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2"
          role="radiogroup"
          aria-label="나이대"
        >
          {AGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={ageRange === opt.value}
              onClick={() => setAgeRange(opt.value)}
              className={`py-3 text-sm border transition ${
                ageRange === opt.value
                  ? 'border-[var(--ink)] bg-[var(--ink)] text-white'
                  : 'border-[var(--line)] hover:border-[var(--ink-muted)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-12 pt-8 border-t border-[var(--line)]">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[var(--ink)]"
            required
          />
          <span className="text-[13px] prose-editorial leading-relaxed">
            수집된 닉네임 · 성별 · 나이대를 서비스 운영과 통계 분석 목적으로
            활용하는 데 동의합니다. 실명·연락처·이메일은 수집하지 않으며, 리포트
            유효기간(7일) 종료 후 요청 시 프로필을 삭제할 수 있습니다.
          </span>
        </label>
      </section>

      {error && (
        <div
          role="alert"
          className="mt-6 border-l-2 border-red-500 pl-4 py-2 text-sm text-red-700"
        >
          시작 실패 · {error}
        </div>
      )}

      <div className="mt-10">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full sm:w-auto px-8 py-4 bg-[var(--ink)] text-white text-sm font-medium rounded-sm disabled:opacity-30"
        >
          {submitting ? '준비 중…' : '검사 시작 →'}
        </button>
      </div>
    </form>
  )
}
