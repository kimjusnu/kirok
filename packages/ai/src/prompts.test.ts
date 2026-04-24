import { describe, expect, it } from 'vitest'
import type { ScoringResult } from '@temperament/scoring'
import type { FactorMeta } from '@temperament/tests'
import {
  buildInterpretationPrompt,
  buildSemanticScholarQuery,
  factorSnapshots,
} from './prompts'

const factors: FactorMeta[] = [
  { id: 'openness', nameKo: '개방성', nameEn: 'Openness', descriptionKo: '' },
  { id: 'conscientiousness', nameKo: '성실성', nameEn: 'Conscientiousness', descriptionKo: '' },
  { id: 'extraversion', nameKo: '외향성', nameEn: 'Extraversion', descriptionKo: '' },
  { id: 'agreeableness', nameKo: '우호성', nameEn: 'Agreeableness', descriptionKo: '' },
  { id: 'neuroticism', nameKo: '신경성', nameEn: 'Neuroticism', descriptionKo: '' },
]

const result: ScoringResult = {
  testId: 'ipip50',
  itemCount: 50,
  answered: 50,
  completed: true,
  factors: [
    { factorId: 'openness', rawMean: 4.1, rawSum: 41, percentile: 82, zScore: 0.9, level: 'high', answeredCount: 10 },
    { factorId: 'conscientiousness', rawMean: 3.2, rawSum: 32, percentile: 48, zScore: -0.05, level: 'average', answeredCount: 10 },
    { factorId: 'extraversion', rawMean: 2.1, rawSum: 21, percentile: 18, zScore: -0.9, level: 'low', answeredCount: 10 },
    { factorId: 'agreeableness', rawMean: 3.8, rawSum: 38, percentile: 70, zScore: 0.5, level: 'high', answeredCount: 10 },
    { factorId: 'neuroticism', rawMean: 2.6, rawSum: 26, percentile: 34, zScore: -0.4, level: 'low', answeredCount: 10 },
  ],
}

describe('factorSnapshots', () => {
  it('maps factor ids to Korean names', () => {
    const snaps = factorSnapshots(result.factors, factors)
    expect(snaps).toHaveLength(5)
    expect(snaps[0]).toMatchObject({ id: 'openness', nameKo: '개방성', percentile: 82, level: 'high' })
  })

  it('falls back to id when factor meta missing', () => {
    const snaps = factorSnapshots(result.factors, [])
    expect(snaps[0]!.nameKo).toBe('openness')
  })
})

describe('buildInterpretationPrompt', () => {
  it('includes score table and JSON schema instructions', () => {
    const prompt = buildInterpretationPrompt({ result, factors })
    expect(prompt).toContain('개방성')
    expect(prompt).toContain('백분위 82')
    expect(prompt).toContain('JSON만 출력')
    expect(prompt).toContain('"overall"')
    expect(prompt).toContain('"factors"')
    expect(prompt).toContain('"suggestions"')
  })

  it('asks for deeper overall (8~10) and per-factor (7~9) sentences', () => {
    const prompt = buildInterpretationPrompt({ result, factors })
    expect(prompt).toContain('8~10문장')
    expect(prompt).toContain('7~9문장')
  })

  it('includes lifeFit structure and career/hobby guidance', () => {
    const prompt = buildInterpretationPrompt({ result, factors })
    expect(prompt).toContain('lifeFit')
    expect(prompt).toContain('careers')
    expect(prompt).toContain('hobbies')
    expect(prompt).toContain('narrative')
    // Psychological mapping guardrail must be present
    expect(prompt).toContain('직업 보장 표현')
    expect(prompt).toContain('상위 2')
  })

  it('asks for structured suggestions with linkedFactor and why', () => {
    const prompt = buildInterpretationPrompt({ result, factors })
    expect(prompt).toContain('practiceLead')
    expect(prompt).toContain('linkedFactor')
    expect(prompt).toContain('why')
    expect(prompt).toContain('최소 3개 이상의 요인에 분산')
  })

  it('lists provided papers under each factor with Korean citation tags', () => {
    const prompt = buildInterpretationPrompt({
      result,
      factors,
      papersByFactor: {
        openness: [
          {
            paperId: 'W1',
            title: 'Openness and creative cognition',
            authors: ['Jane Smith', 'Min Lee'],
            year: 2020,
            doi: null,
            url: null,
            abstract: null,
          },
        ],
      },
    })
    expect(prompt).toContain('참고 연구')
    expect(prompt).toContain('Openness and creative cognition')
    expect(prompt).toContain('(Smith & Lee, 2020)')
  })

  it('restricts Gemini to the provided paper list when papers are supplied', () => {
    const prompt = buildInterpretationPrompt({
      result,
      factors,
      papersByFactor: {
        openness: [
          {
            paperId: 'W1',
            title: 'Any',
            authors: ['Jane Smith'],
            year: 2020,
            doi: null,
            url: null,
            abstract: null,
          },
        ],
      },
    })
    expect(prompt).toMatch(/지어내거나 추측하지|다른 연구를 지어내/)
  })

  it('omits the citation guidance block when no papers are available', () => {
    const prompt = buildInterpretationPrompt({
      result,
      factors,
      papersByFactor: { openness: [], conscientiousness: [] },
    })
    expect(prompt).not.toContain('인용 지침:')
    expect(prompt).not.toMatch(/지어내거나 추측하지/)
  })
})

describe('buildSemanticScholarQuery', () => {
  it('returns a specific Big Five query per factor', () => {
    expect(buildSemanticScholarQuery({ id: 'openness', nameKo: '개방성', percentile: 50, level: 'average', rawMean: 3 })).toMatch(/openness/i)
    expect(buildSemanticScholarQuery({ id: 'neuroticism', nameKo: '신경성', percentile: 50, level: 'average', rawMean: 3 })).toMatch(/neuroticism/i)
  })

  it('falls back for unknown factor id', () => {
    expect(buildSemanticScholarQuery({ id: 'foo', nameKo: 'x', percentile: 50, level: 'average', rawMean: 3 })).toContain('foo')
  })
})
