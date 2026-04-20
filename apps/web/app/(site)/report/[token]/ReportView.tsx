'use client'

import { useCallback, useEffect, useState } from 'react'
import { FactorRadar } from './FactorRadar'

type Paper = {
  paperId: string
  title: string
  authors: string[]
  year: number | null
  doi: string | null
  url: string | null
  inline: string
}
type FactorCitations = { factorId: string; papers: Paper[] }
type Interpretation = {
  overall: string
  factors: Record<string, string>
  suggestions: string[]
}
export type ReportPayload = {
  rawScores: Record<string, number>
  percentiles: Record<string, number>
  interpretation: Interpretation
  citations: FactorCitations[]
}

export type FactorMetaLite = {
  id: string
  nameKo: string
  descriptionKo: string
}

const LEVEL_LABELS: Array<[number, string]> = [
  [90, '매우 높음'],
  [70, '높음'],
  [30, '평균'],
  [10, '낮음'],
  [0, '매우 낮음'],
]

function levelLabel(percentile: number): string {
  for (const [threshold, label] of LEVEL_LABELS) {
    if (percentile >= threshold) return label
  }
  return '매우 낮음'
}

export function ReportView({
  sessionId,
  testNameKo,
  factors,
  cached,
}: {
  sessionId: string
  testNameKo: string
  factors: FactorMetaLite[]
  cached: ReportPayload | null
}) {
  const [state, setState] = useState<
    | { kind: 'ready'; data: ReportPayload }
    | { kind: 'loading' }
    | { kind: 'error'; message: string }
  >(cached ? { kind: 'ready', data: cached } : { kind: 'loading' })

  const generate = useCallback(async () => {
    setState({ kind: 'loading' })
    try {
      const res = await fetch('/api/results/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      const body = await res.json()
      if (!res.ok) {
        setState({ kind: 'error', message: body.error ?? `HTTP_${res.status}` })
        return
      }
      setState({
        kind: 'ready',
        data: {
          rawScores: body.rawScores,
          percentiles: body.percentiles,
          interpretation: body.interpretation,
          citations: body.citations,
        },
      })
    } catch (e) {
      setState({
        kind: 'error',
        message: e instanceof Error ? e.message : 'generate_failed',
      })
    }
  }, [sessionId])

  useEffect(() => {
    if (state.kind !== 'loading') return
    void generate()
    // run once on mount when no cache was available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state.kind === 'loading') {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <div className="inline-block w-6 h-6 border border-[var(--line)] border-t-[var(--ink)] rounded-full animate-spin" />
        <p className="mt-6 prose-editorial text-sm text-[var(--ink-muted)]">
          점수를 분석하고 해석을 작성하는 중.
          <br />
          논문 인용도 함께 가져오고 있어요 (약 10–20초).
        </p>
      </div>
    )
  }

  if (state.kind === 'error') {
    return (
      <div className="max-w-xl mx-auto px-6 py-16">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Error
        </p>
        <h1 className="mt-4 text-2xl font-semibold">리포트 생성 중 오류</h1>
        <div className="mt-4 border-l-2 border-red-500 pl-4 py-2 text-sm text-red-700">
          {state.message}
        </div>
        <button
          type="button"
          onClick={generate}
          className="mt-8 px-5 py-3 bg-[var(--ink)] text-white rounded-sm text-sm font-medium"
        >
          다시 시도
        </button>
      </div>
    )
  }

  const { data } = state
  const radarFactors = factors.map((f) => ({
    id: f.id,
    label: f.nameKo,
    percentile: data.percentiles[f.id] ?? 50,
  }))

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 sm:py-16">
      <header>
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Report · {testNameKo}
        </p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
          당신의 Big Five 프로파일
        </h1>
        <span className="block w-12 h-px bg-[var(--ink)] mt-6" aria-hidden />
      </header>

      <section className="mt-12">
        <FactorRadar factors={radarFactors} />
        <p className="mt-4 text-center text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          percentile · 50 = average
        </p>
      </section>

      <section className="mt-16">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          01. Overview
        </p>
        <h2 className="mt-3 text-xl font-semibold">전체 요약</h2>
        <p className="mt-5 prose-editorial text-[16px] whitespace-pre-wrap">
          {data.interpretation.overall}
        </p>
      </section>

      <section className="mt-16">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          02. Factors
        </p>
        <h2 className="mt-3 text-xl font-semibold">요인별 해석</h2>

        <div className="mt-8 divide-y divide-[var(--line)]">
          {factors.map((f, idx) => {
            const p = data.percentiles[f.id] ?? 50
            const interp = data.interpretation.factors[f.id]
            const papers = data.citations.find((c) => c.factorId === f.id)?.papers ?? []
            return (
              <article key={f.id} className="py-10 first:pt-0">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-[var(--ink-soft)]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-lg font-semibold">{f.nameKo}</h3>
                  </div>
                  <div className="text-sm text-[var(--ink-muted)]">
                    <span className="font-mono">{p}</span>
                    <span className="ml-2 text-[11px] text-[var(--ink-soft)] uppercase tracking-wider">
                      {levelLabel(p)}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-[13px] text-[var(--ink-soft)] leading-relaxed">
                  {f.descriptionKo}
                </p>

                <div className="mt-4 h-px bg-[var(--line)] relative">
                  <div
                    className="absolute inset-y-0 left-0 h-px bg-[var(--ink)]"
                    style={{ width: `${Math.max(0, Math.min(100, p))}%` }}
                    aria-hidden
                  />
                </div>

                {interp && (
                  <p className="mt-6 prose-editorial text-[15px] whitespace-pre-wrap">
                    {interp}
                  </p>
                )}

                {papers.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
                      Cited
                    </h4>
                    <ul className="mt-3 space-y-2 text-[13px]">
                      {papers.slice(0, 3).map((p) => (
                        <li key={p.paperId} className="leading-snug">
                          <a
                            href={
                              p.url ?? (p.doi ? `https://doi.org/${p.doi}` : '#')
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-underline"
                          >
                            {p.title}
                          </a>
                          <span className="ml-1 text-[11px] text-[var(--ink-soft)]">
                            {p.inline}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>

      {data.interpretation.suggestions.length > 0 && (
        <section className="mt-16">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            03. Practice
          </p>
          <h2 className="mt-3 text-xl font-semibold">시도해 볼 만한 것</h2>
          <ol className="mt-6 space-y-5">
            {data.interpretation.suggestions.map((s, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-mono text-xs text-[var(--ink-soft)] pt-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="prose-editorial text-[15px] flex-1">{s}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <footer className="mt-20 pt-8 border-t border-[var(--line)] text-[11px] text-[var(--ink-soft)] leading-relaxed">
        이 결과는 학습·자기이해 목적의 참고 자료이며, 임상 진단이 아닙니다. 리포트
        링크는 결제일로부터 7일간 유효합니다.
      </footer>
    </div>
  )
}
