'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Item = { order: number; textKo: string }

const SCALE_LABELS = [
  { v: 1, label: '전혀 그렇지 않다' },
  { v: 2, label: '그렇지 않다' },
  { v: 3, label: '보통이다' },
  { v: 4, label: '그렇다' },
  { v: 5, label: '매우 그렇다' },
]

function storageKey(slug: string): string {
  return `temperament:responses:${slug}`
}

type Saved = { responses: Record<number, number>; cursor: number; sessionId?: string; accessToken?: string }

function loadSaved(slug: string): Saved {
  if (typeof window === 'undefined') return { responses: {}, cursor: 0 }
  try {
    const raw = window.localStorage.getItem(storageKey(slug))
    if (!raw) return { responses: {}, cursor: 0 }
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed) {
      return {
        responses: parsed.responses ?? {},
        cursor: typeof parsed.cursor === 'number' ? parsed.cursor : 0,
        sessionId: parsed.sessionId,
        accessToken: parsed.accessToken,
      }
    }
  } catch {
    // ignore — treat as fresh
  }
  return { responses: {}, cursor: 0 }
}

function persist(slug: string, data: Saved) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(data))
  } catch {
    // quota exceeded — silently skip
  }
}

function clearSaved(slug: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(storageKey(slug))
  } catch {
    // ignore
  }
}

export function TestRunner({
  slug,
  nameKo,
  estimatedMinutes,
  items,
  translationNote,
}: {
  slug: string
  nameKo: string
  estimatedMinutes: number
  items: Item[]
  translationNote: string
}) {
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)
  const [responses, setResponses] = useState<Record<number, number>>({})
  const [cursor, setCursor] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const saved = loadSaved(slug)
    setResponses(saved.responses)
    setCursor(Math.min(saved.cursor, items.length - 1))
    setHydrated(true)
  }, [slug, items.length])

  // Persist on every change.
  useEffect(() => {
    if (!hydrated) return
    persist(slug, { responses, cursor })
  }, [slug, responses, cursor, hydrated])

  const total = items.length
  const answered = Object.keys(responses).length
  const current = items[cursor]
  const selected = current ? responses[current.order] : undefined
  const canGoNext = selected !== undefined
  const isLast = cursor === total - 1
  const allAnswered = useMemo(
    () => items.every((i) => responses[i.order] !== undefined),
    [items, responses],
  )

  const choose = useCallback(
    (score: number) => {
      if (!current) return
      setResponses((prev) => ({ ...prev, [current.order]: score }))
      // Auto-advance unless last question.
      if (cursor < total - 1) {
        setTimeout(() => setCursor((c) => Math.min(c + 1, total - 1)), 120)
      }
    },
    [current, cursor, total],
  )

  const goPrev = useCallback(() => setCursor((c) => Math.max(c - 1, 0)), [])
  const goNext = useCallback(() => setCursor((c) => Math.min(c + 1, total - 1)), [total])

  // Keyboard: 1-5 select, ← → navigate.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key >= '1' && e.key <= '5') {
        const score = Number(e.key)
        choose(score)
      } else if (e.key === 'ArrowLeft') {
        goPrev()
      } else if (e.key === 'ArrowRight') {
        goNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [choose, goPrev, goNext])

  const submit = useCallback(async () => {
    setSubmitting(true)
    setError(null)
    try {
      // Create session if not yet created.
      let saved = loadSaved(slug)
      if (!saved.sessionId || !saved.accessToken) {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testSlug: slug }),
        })
        if (!res.ok) throw new Error('session_create_failed')
        const body = await res.json()
        saved = {
          ...saved,
          sessionId: body.sessionId,
          accessToken: body.accessToken,
        }
        persist(slug, saved)
      }

      const payload = {
        sessionId: saved.sessionId,
        responses: Object.entries(responses).map(([order, score]) => ({
          order: Number(order),
          score,
        })),
      }
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'submit_failed')
      }

      // Move on — payment page is Phase 6B; for now, go to a placeholder.
      router.push(`/test/${slug}/pay?sid=${saved.sessionId}&at=${saved.accessToken}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'submit_failed')
    } finally {
      setSubmitting(false)
    }
  }, [slug, responses, router])

  if (!hydrated) {
    return (
      <div className="max-w-xl mx-auto p-10 text-center text-sm text-[var(--ink-soft)]">
        불러오는 중…
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="max-w-xl mx-auto px-6 py-10 sm:py-14">
      <header className="mb-10">
        <div className="flex items-baseline justify-between text-xs">
          <span className="tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            {nameKo}
          </span>
          <span className="font-mono text-[var(--ink-muted)]">
            {String(cursor + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>
        <div className="mt-3 h-px bg-[var(--line)] overflow-hidden">
          <div
            className="h-full bg-[var(--ink)] transition-all duration-300"
            style={{ width: `${((cursor + 1) / total) * 100}%` }}
            aria-hidden
          />
        </div>
        <div className="mt-2 text-[11px] text-[var(--ink-soft)]">
          응답 {answered} · 약 {estimatedMinutes}분
        </div>
      </header>

      <section aria-labelledby="item-text">
        <p
          id="item-text"
          className="text-2xl sm:text-[28px] font-medium leading-[1.5] tracking-tight"
        >
          {current.textKo}
        </p>

        <div className="mt-10 space-y-2" role="radiogroup" aria-label="응답">
          {SCALE_LABELS.map((opt) => {
            const isSelected = selected === opt.v
            return (
              <button
                key={opt.v}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => choose(opt.v)}
                className={`w-full text-left px-5 py-4 border transition ${
                  isSelected
                    ? 'border-[var(--ink)] bg-[var(--ink)] text-white'
                    : 'border-[var(--line)] hover:border-[var(--ink-muted)]'
                }`}
              >
                <span
                  className={`inline-block w-6 font-mono text-xs mr-3 ${
                    isSelected ? 'opacity-60' : 'text-[var(--ink-soft)]'
                  }`}
                >
                  {opt.v}
                </span>
                <span className="text-[15px]">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      <div className="mt-10 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={cursor === 0}
          className="text-sm text-[var(--ink-muted)] disabled:opacity-30 link-underline"
        >
          ← 이전
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={submit}
            disabled={!allAnswered || submitting}
            className="px-5 py-3 bg-[var(--ink)] text-white text-sm font-medium rounded-sm disabled:opacity-40"
          >
            {submitting ? '제출 중…' : '제출하고 결과 보기 →'}
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className="text-sm font-medium disabled:opacity-30 link-underline"
          >
            다음 →
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 border-l-2 border-red-500 pl-4 py-2 text-sm text-red-700"
        >
          제출 중 오류: {error}. 잠시 후 다시 시도해 주세요.
        </div>
      )}

      {answered === total && (
        <div className="mt-10 text-right">
          <button
            type="button"
            className="text-[11px] text-[var(--ink-soft)] link-underline"
            onClick={() => {
              if (confirm('저장된 응답을 모두 지우고 처음부터 시작할까요?')) {
                clearSaved(slug)
                setResponses({})
                setCursor(0)
              }
            }}
          >
            초기화
          </button>
        </div>
      )}

      <div className="mt-14 pt-8 border-t border-[var(--line)]">
        <p className="text-[11px] text-[var(--ink-soft)] leading-relaxed">
          {translationNote}
        </p>
        <p className="mt-2 text-[11px] text-[var(--ink-soft)] font-mono">
          단축키 · 1–5 선택 · ← → 이동
        </p>
      </div>
    </div>
  )
}
