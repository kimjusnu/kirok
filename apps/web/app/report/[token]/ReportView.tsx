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
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
        <p className="mt-4 text-sm text-gray-600">
          점수를 분석하고 해석을 작성하는 중…
          <br />
          논문 인용도 함께 가져오고 있어요 (약 10–20초).
        </p>
      </div>
    )
  }

  if (state.kind === 'error') {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold">리포트 생성 중 오류</h1>
        <p className="mt-3 text-sm text-red-700 bg-red-50 p-3 rounded">
          {state.message}
        </p>
        <button
          type="button"
          onClick={generate}
          className="mt-6 px-5 py-2.5 bg-black text-white rounded-md text-sm font-medium"
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
    <div className="max-w-2xl mx-auto p-6 sm:p-8">
      <header>
        <p className="text-xs text-gray-500">{testNameKo} · 결과 리포트</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold">당신의 Big Five 프로파일</h1>
      </header>

      <section className="mt-8 p-5 bg-white rounded-lg border border-gray-200">
        <FactorRadar factors={radarFactors} />
        <p className="mt-4 text-xs text-center text-gray-500">
          백분위 기준 (50이 평균)
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">전체 요약</h2>
        <p className="mt-3 text-gray-800 leading-relaxed whitespace-pre-wrap">
          {data.interpretation.overall}
        </p>
      </section>

      <section className="mt-8 space-y-6">
        <h2 className="text-lg font-semibold">요인별 해석</h2>
        {factors.map((f) => {
          const p = data.percentiles[f.id] ?? 50
          const interp = data.interpretation.factors[f.id]
          const papers = data.citations.find((c) => c.factorId === f.id)?.papers ?? []
          return (
            <article
              key={f.id}
              className="p-5 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold">{f.nameKo}</h3>
                <div className="text-sm text-gray-600">
                  백분위 <span className="font-semibold text-gray-900">{p}</span>
                  <span className="ml-2 text-xs text-gray-500">({levelLabel(p)})</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">{f.descriptionKo}</p>

              <div className="mt-3 h-1.5 bg-gray-100 rounded overflow-hidden">
                <div
                  className="h-full bg-black"
                  style={{ width: `${Math.max(0, Math.min(100, p))}%` }}
                  aria-hidden
                />
              </div>

              {interp && (
                <p className="mt-4 text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {interp}
                </p>
              )}

              {papers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    관련 학술 논문
                  </h4>
                  <ul className="mt-2 space-y-2 text-sm">
                    {papers.slice(0, 3).map((p) => (
                      <li key={p.paperId}>
                        <a
                          href={
                            p.url ??
                            (p.doi ? `https://doi.org/${p.doi}` : '#')
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-800 underline underline-offset-2 decoration-gray-300 hover:decoration-gray-700"
                        >
                          {p.title}
                        </a>
                        <span className="ml-1 text-xs text-gray-500">{p.inline}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          )
        })}
      </section>

      {data.interpretation.suggestions.length > 0 && (
        <section className="mt-8 p-5 bg-gray-900 text-white rounded-lg">
          <h2 className="text-base font-semibold">시도해 볼 만한 것</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-100">
            {data.interpretation.suggestions.map((s, i) => (
              <li key={i}>· {s}</li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-10 text-center text-[11px] text-gray-400 leading-relaxed">
        이 결과는 학습·자기이해 목적의 참고 자료이며, 임상 진단이 아닙니다.
        <br />
        리포트 링크는 결제일로부터 7일간 유효합니다.
      </footer>
    </div>
  )
}
