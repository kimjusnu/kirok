'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
type CareerCard = { title: string; reason: string; fit?: number }
type HobbyCard = { title: string; reason: string; fit?: number }
type LifeFit = {
  careers: CareerCard[]
  hobbies: HobbyCard[]
  narrative: string
}
type SuggestionItem = {
  text: string
  linkedFactor?: string
  why?: string
}
type Interpretation = {
  overall: string
  factors: Record<string, string>
  // Structured: each suggestion may carry a linkedFactor id + a "why for you"
  // sentence. Legacy reports are rehydrated from plain strings server-side
  // (see packages/ai SuggestionSchema preprocess).
  suggestions: SuggestionItem[]
  // Optional — legacy reports generated before the Life Fit rollout will
  // not include it; the UI then shows a "regenerate" banner.
  lifeFit?: LifeFit
  practiceLead?: string
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

// Map the /api/results/generate failure payload to a user-facing message.
// The backend returns { error, stage, code } — code is the specific Gemini
// status (e.g. UNAVAILABLE) that tells us if it's a "try again" case.
function friendlyError(body: {
  error?: string
  stage?: string
  code?: string
}): string {
  const code = body.code
  if (
    code === 'UNAVAILABLE' ||
    code === 'HTTP_503' ||
    code === 'HTTP_502' ||
    code === 'DEADLINE_EXCEEDED'
  ) {
    return 'AI 서버가 지금 많이 몰려 있어요. 잠시 후 "다시 시도"를 눌러 주세요.'
  }
  if (code === 'RESOURCE_EXHAUSTED' || code === 'HTTP_429') {
    return '오늘 AI 호출 한도를 초과했어요. 잠시 후 다시 시도해 주세요.'
  }
  if (code === 'INVALID_JSON') {
    return 'AI 응답을 해석하지 못했어요. 한 번 더 시도하면 대부분 해결됩니다.'
  }
  if (body.error === 'session_not_paid') {
    return '결제가 완료되어야 리포트가 열립니다.'
  }
  if (body.error === 'session_expired') {
    return '리포트 유효기간(7일)이 지났습니다.'
  }
  return body.error ?? '알 수 없는 오류'
}

function levelLabel(percentile: number): string {
  for (const [threshold, label] of LEVEL_LABELS) {
    if (percentile >= threshold) return label
  }
  return '매우 낮음'
}

// 1~5 dots — filled for `value`, faded for the rest.
// Uses ● glyphs so it survives black-and-white print without Tailwind colors.
function FitBadge({ value }: { value: number }) {
  const v = Math.max(1, Math.min(5, Math.round(value)))
  return (
    <span
      aria-label={`적합도 ${v}/5`}
      title={`적합도 ${v}/5`}
      className="shrink-0 font-mono text-[10px] tracking-widest text-[var(--ink-soft)] leading-none pt-1"
    >
      <span>{'●'.repeat(v)}</span>
      <span className="opacity-25">{'●'.repeat(5 - v)}</span>
    </span>
  )
}

function LifeFitCardList({
  title,
  cards,
}: {
  title: string
  cards: Array<CareerCard | HobbyCard>
}) {
  return (
    <div className="mt-8">
      <h3 className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
        {title}
      </h3>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2">
        {cards.map((c, i) => (
          <article
            key={`${c.title}-${i}`}
            className="border border-[var(--line)] bg-[var(--line-soft)] p-5 hover:border-[var(--ink)] transition-colors print:break-inside-avoid"
          >
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-[15px] font-semibold leading-tight">
                {c.title}
              </h4>
              {typeof c.fit === 'number' && <FitBadge value={c.fit} />}
            </div>
            <p className="mt-3 text-[13px] text-[var(--ink-muted)] leading-relaxed">
              {c.reason}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}

export function ReportView({
  sessionId,
  testNameKo,
  factors,
  cached,
  reportKey,
}: {
  sessionId: string
  testNameKo: string
  factors: FactorMetaLite[]
  cached: ReportPayload | null
  reportKey: string | null
}) {
  const [state, setState] = useState<
    | { kind: 'ready'; data: ReportPayload }
    | { kind: 'loading' }
    | { kind: 'error'; message: string }
  >(cached ? { kind: 'ready', data: cached } : { kind: 'loading' })

  // Guards against React StrictMode's double-invoke in dev, which would fire
  // two parallel /generate calls and briefly flash an error before the second
  // succeeded. Also prevents concurrent manual retries.
  const inFlightRef = useRef(false)

  const callGenerate = useCallback(
    async (
      options: { force?: boolean } = {},
    ): Promise<
      { ok: true; data: ReportPayload } | { ok: false; message: string }
    > => {
      try {
        const res = await fetch('/api/results/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, force: options.force ?? false }),
        })
        const body = await res.json()
        if (!res.ok) {
          return { ok: false, message: friendlyError(body) }
        }
        return {
          ok: true,
          data: {
            rawScores: body.rawScores,
            percentiles: body.percentiles,
            interpretation: body.interpretation,
            citations: body.citations,
          },
        }
      } catch (e) {
        return {
          ok: false,
          message: e instanceof Error ? e.message : 'generate_failed',
        }
      }
    },
    [sessionId],
  )

  const generate = useCallback(
    async (
      options: { silentRetry?: boolean; force?: boolean } = {
        silentRetry: true,
      },
    ) => {
      if (inFlightRef.current) return
      inFlightRef.current = true
      setState({ kind: 'loading' })
      try {
        let attempt = await callGenerate({ force: options.force })
        if (!attempt.ok && options.silentRetry) {
          // Absorb transient Gemini/OpenAlex flakes — retry once after a brief
          // pause before surfacing the error to the user.
          await new Promise((r) => setTimeout(r, 1500))
          attempt = await callGenerate({ force: options.force })
        }
        if (attempt.ok) {
          setState({ kind: 'ready', data: attempt.data })
        } else {
          setState({ kind: 'error', message: attempt.message })
        }
      } finally {
        inFlightRef.current = false
      }
    },
    [callGenerate],
  )

  useEffect(() => {
    if (state.kind !== 'loading') return
    void generate()
    // run once on mount when no cache was available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') window.print()
  }, [])

  const [copied, setCopied] = useState(false)
  const copyKey = useCallback(async () => {
    if (!reportKey) return
    try {
      await navigator.clipboard.writeText(reportKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Fallback: select-and-leave — user can manually copy from the span.
    }
  }, [reportKey])

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
          onClick={() => void generate({ silentRetry: true })}
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
    <div className="max-w-2xl mx-auto px-6 py-12 sm:py-16 report-root">
      <header>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
              Report · {testNameKo}
            </p>
            <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
              당신의 Big Five 프로파일
            </h1>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="no-print shrink-0 mt-1 px-3 py-2 text-[11px] tracking-[0.1em] uppercase border border-[var(--line)] hover:border-[var(--ink)] transition"
            aria-label="리포트를 PDF로 저장"
          >
            PDF 저장
          </button>
        </div>
        <span className="block w-12 h-px bg-[var(--ink)] mt-6" aria-hidden />

        {reportKey && (
          <div className="mt-8 border border-[var(--line)] bg-[var(--line-soft)] px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
                리포트 키 · Report Key
              </p>
              <p className="mt-2 text-lg font-mono tracking-[0.2em] font-semibold select-all">
                {reportKey}
              </p>
              <p className="mt-1 text-[11px] text-[var(--ink-soft)] leading-relaxed">
                이 키를 메모해 두면 홈 &quot;이전 검사 보기&quot;에서 다시 열 수 있어요.
                (리포트는 결제 후 7일간 유효)
              </p>
            </div>
            <button
              type="button"
              onClick={copyKey}
              className="no-print shrink-0 px-3 py-2 text-[11px] tracking-[0.1em] uppercase border border-[var(--line)] hover:border-[var(--ink)] transition"
              aria-label="리포트 키 복사"
            >
              {copied ? '복사됨' : '복사'}
            </button>
          </div>
        )}
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

      {data.interpretation.lifeFit && (
        <section className="mt-16">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            03. Life Fit
          </p>
          <h2 className="mt-3 text-xl font-semibold">직업 · 취미의 지도</h2>
          <p className="mt-2 text-[13px] text-[var(--ink-soft)] leading-relaxed">
            점수의 조합에서 파생된 제안입니다. 정답이 아니라 나침반으로 읽어 주세요.
          </p>

          <LifeFitCardList
            title="Careers"
            cards={data.interpretation.lifeFit.careers}
          />
          <LifeFitCardList
            title="Hobbies"
            cards={data.interpretation.lifeFit.hobbies}
          />

          {data.interpretation.lifeFit.narrative && (
            <div className="mt-10 pl-5 border-l-2 border-[var(--ink)]">
              <p className="prose-editorial text-[15px] whitespace-pre-wrap">
                {data.interpretation.lifeFit.narrative}
              </p>
            </div>
          )}
        </section>
      )}

      {data.interpretation.suggestions.length > 0 && (
        <section className="mt-16">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            {data.interpretation.lifeFit ? '04' : '03'}. Practice
          </p>
          <h2 className="mt-3 text-xl font-semibold">시도해 볼 만한 것</h2>
          {data.interpretation.practiceLead && (
            <p className="mt-3 text-[13px] text-[var(--ink-soft)] leading-relaxed">
              {data.interpretation.practiceLead}
            </p>
          )}
          <ol className="mt-6 space-y-6">
            {data.interpretation.suggestions.map((s, i) => {
              const factorName =
                s.linkedFactor
                  ? factors.find((f) => f.id === s.linkedFactor)?.nameKo
                  : undefined
              return (
                <li key={i} className="flex gap-4">
                  <span className="font-mono text-xs text-[var(--ink-soft)] pt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    {factorName && (
                      <span className="inline-block mb-2 px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase border border-[var(--line)] text-[var(--ink-soft)]">
                        {factorName}
                      </span>
                    )}
                    <p className="prose-editorial text-[15px]">{s.text}</p>
                    {s.why && (
                      <p className="mt-2 pl-3 border-l border-[var(--line)] text-[12px] text-[var(--ink-muted)] leading-relaxed">
                        왜 당신에게? {s.why}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {!data.interpretation.lifeFit && (
        <div className="mt-12 no-print border border-[var(--line)] bg-[var(--line-soft)] p-5 text-[13px] text-[var(--ink-muted)] leading-relaxed">
          <p>
            이전 버전에서 생성된 리포트예요. 새 버전에서는{' '}
            <strong className="text-[var(--ink)]">직업 · 취미 제안</strong>과{' '}
            더 깊어진 요인 해석이 함께 제공됩니다.
          </p>
          <button
            type="button"
            onClick={() => void generate({ silentRetry: true, force: true })}
            className="mt-3 link-underline font-medium text-[var(--ink)]"
          >
            지금 다시 생성하기 →
          </button>
        </div>
      )}

      <div className="mt-16 no-print">
        <button
          type="button"
          onClick={handlePrint}
          className="w-full px-5 py-4 bg-[var(--ink)] text-white text-sm font-medium rounded-sm"
        >
          이 리포트를 PDF로 저장
        </button>
        <p className="mt-2 text-[11px] text-[var(--ink-soft)] text-center">
          브라우저 인쇄 창에서 &quot;PDF로 저장&quot;을 선택하세요. 링크 유효기간은 7일입니다.
        </p>
      </div>

      <footer className="mt-12 pt-8 border-t border-[var(--line)] text-[11px] text-[var(--ink-soft)] leading-relaxed">
        이 결과는 학습·자기이해 목적의 참고 자료이며, 임상 진단이 아닙니다. 리포트
        링크는 결제일로부터 7일간 유효합니다.
      </footer>
    </div>
  )
}
