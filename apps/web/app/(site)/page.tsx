import Link from 'next/link'
import Image from 'next/image'
import { PreviousReportLookup } from './PreviousReportLookup'

const ANCHOR_PRICE = 4900
const SALE_PRICE = 1500

const FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'MBTI 결과랑은 어떻게 다른가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MBTI는 사람을 16개 유형 중 하나로 분류합니다. 같은 INFP라도 사람마다 실제 성격은 꽤 다릅니다. Big Five는 유형을 붙이는 대신 다섯 가지 성향이 각각 얼마나 강한지를 숫자로 보여 줍니다. 그래서 같은 특성을 가진 사람끼리도 누가 더 강한 편인지까지 구분할 수 있습니다. 학술적으로는 Big Five의 재검사 신뢰도와 예측 타당도가 MBTI보다 일관되게 높다고 보고됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '익명인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '회원가입이 없습니다. 시작 전 리포트에 표시할 닉네임과 성별·나이대만 수집하며(모두 "미응답" 선택 가능), 실명·이메일·전화번호는 저장하지 않습니다. 결제 시점에는 카카오페이가 결제 정보를 처리하며 본 사이트에는 카드 번호가 남지 않습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '리포트는 어디에 저장되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '결제 후 발급되는 7일 유효 고유 링크로만 접근할 수 있습니다. 링크를 잃어버리면 복구가 어렵기 때문에 북마크를 권장합니다.',
      },
    },
    {
      '@type': 'Question',
      name: 'AI 해석이 정확한가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AI는 5요인 점수 패턴을 한국어 문장으로 풀어 주는 보조 도구이며, 임상 진단이 아닙니다. 인용되는 논문은 AI가 생성하지 않고 OpenAlex 학술 데이터베이스에서 실제로 검색된 결과만 붙입니다.',
      },
    },
    {
      '@type': 'Question',
      name: '직업·취미 추천은 어떻게 만들어지나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '다섯 요인의 점수 조합을 기반으로 상위 2~3개 요인과 직접 연관된 직무·취미를 4~6개씩 카드로 제시합니다. 개방성·성실성·외향성·우호성·신경성이 실제 직무 만족과 수행에 미치는 영향을 다룬 성격심리학 매핑(예: Barrick & Mount, 1991)을 참조하여 근거 한 줄을 붙이며, 점수가 높다고 해서 그 직업이 보장된다는 표현은 사용하지 않습니다. 정답이 아니라 방향 탐색용 나침반입니다.',
      },
    },
    {
      '@type': 'Question',
      name: '한 주짜리 실험은 어떤 식으로 제안되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '"언제 · 어디서 · 무엇을 · 어떻게" 네 요소가 담긴 실행 가능한 문장 4~6개가 나오며, 각 항목에는 그 실험이 어느 요인과 맞닿아 있는지 요인 배지와 "왜 당신에게 이 실험인지" 한 줄 근거가 함께 붙습니다. "자주 ~하세요" 같은 추상적 조언은 배제됩니다.',
      },
    },
  ],
}

export default function HomePage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />

      {/* HERO — premium atmosphere via aurora + spotlight + grain layers. */}
      <section className="relative min-h-[88vh] flex flex-col justify-center overflow-hidden">
        <div aria-hidden className="hero-bg pointer-events-none">
          <span className="hero-aurora hero-aurora-a" />
          <span className="hero-aurora hero-aurora-b" />
          <span className="hero-aurora hero-aurora-c" />
          <span className="hero-spotlight" />
          <span className="hero-grain" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full px-6 lg:px-12 pt-28 pb-28 sm:pt-36 sm:pb-40">
          <p className="eyebrow line-reveal" style={{ ['--d' as string]: '0ms' }}>
            성격검사 · Big Five 모델
          </p>

          <h1 className="mt-8 font-bold leading-[0.95] tracking-tight text-[clamp(2.7rem,9vw,6.75rem)]">
            <span
              className="block line-reveal"
              style={{ ['--d' as string]: '120ms' }}
            >
              나도 몰랐던 나,
            </span>
            <span className="block mt-1">
              {'10분이면 '.split('').map((c, i) => (
                <span
                  key={`p-${i}`}
                  className="char-reveal"
                  style={{ ['--d' as string]: `${260 + i * 55}ms` }}
                >
                  {c === ' ' ? '\u00A0' : c}
                </span>
              ))}
              <span className="highlight-bar">
                {'압니다'.split('').map((c, i) => (
                  <span
                    key={`h-${i}`}
                    className="char-reveal"
                    style={{ ['--d' as string]: `${260 + (6 + i) * 55}ms` }}
                  >
                    {c}
                  </span>
                ))}
              </span>
              <span
                className="char-reveal"
                style={{ ['--d' as string]: `${260 + 9 * 55}ms` }}
              >
                .
              </span>
            </span>
          </h1>

          <div className="mt-12 grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
            <div
              className="line-reveal"
              style={{ ['--d' as string]: '900ms' }}
            >
              <p className="prose-editorial text-[17px] lg:text-[19px] max-w-xl">
                같은 INFP인데도 어떤 친구는 낯선 사람과 5분이면 말이 통하고,
                어떤 친구는 30분이 지나도 조용합니다. 유형 하나로 사람을 다
                설명할 수는 없습니다. kirok은 당신의 성격을{' '}
                <strong>다섯 가지 면</strong>에서 자세히 들여다보고, 각각 어느
                쪽으로 얼마나 치우쳤는지 한국어 문장으로 풀어 드립니다.
              </p>
              <p className="prose-editorial mt-5 text-[14px] text-[var(--ink-muted)] max-w-lg">
                10분이면 끝나는 50문항, AI가 써 주는 한국어 해석, 진짜 학술
                논문이 붙은 익명 리포트를 커피 한 잔 값에 받습니다.
              </p>
            </div>

            <div
              className="relative line-reveal h-full"
              style={{ ['--d' as string]: '1100ms' }}
            >
              {/* 카드 높이를 왼쪽 텍스트 컬럼과 동일하게 맞추기 위해 h-full +
                  flex column + justify-between. 위쪽 블록(스탯), 아래쪽 블록
                  (CTA 버튼·안내)이 카드 상하로 자연스럽게 벌어진다. */}
              <div className="relative corner-marks border border-[var(--line)] bg-white/70 backdrop-blur-sm px-6 py-6 h-full flex flex-col justify-between">
                <span className="tl" />
                <span className="tr" />
                <span className="bl" />
                <span className="br" />
                <dl className="grid grid-cols-3 gap-4">
                  <div>
                    <dt className="text-[10px] tracking-[0.15em] uppercase text-[var(--ink-soft)]">
                      소요
                    </dt>
                    <dd className="mt-2 text-2xl font-semibold tracking-tight">
                      10분
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] tracking-[0.15em] uppercase text-[var(--ink-soft)]">
                      문항
                    </dt>
                    <dd className="mt-2 text-2xl font-semibold tracking-tight">
                      50개
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] tracking-[0.15em] uppercase text-[var(--ink-soft)]">
                      가격
                    </dt>
                    <dd className="mt-2 text-2xl font-semibold tracking-tight">
                      {SALE_PRICE.toLocaleString()}
                      <span className="text-[var(--ink-soft)] line-through ml-1 font-normal text-sm">
                        {ANCHOR_PRICE.toLocaleString()}
                      </span>
                    </dd>
                  </div>
                </dl>
                <div className="mt-8">
                  <Link
                    href="/test/ipip50"
                    className="inline-flex items-center justify-center w-full gap-2 text-[15px] font-medium px-6 py-3.5 bg-[var(--ink)] text-white rounded-sm hover:bg-black transition group"
                  >
                    검사 시작
                    <span
                      aria-hidden
                      className="transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                  <p className="mt-3 text-[11px] text-[var(--ink-soft)] text-center">
                    AI 해석 + 학술 논문 인용 · 익명 리포트
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats marquee — acts as the hero's underline. */}
        <div
          className="relative z-10 border-t border-[var(--line)] bg-white/60 backdrop-blur-sm py-6 overflow-hidden line-reveal"
          style={{ ['--d' as string]: '1300ms' }}
        >
          <div className="marquee gap-16 whitespace-nowrap">
            {[0, 1].map((loop) => (
              <div key={loop} className="flex gap-16 shrink-0 pr-16">
                {[
                  { big: '50문항', small: '약 10분', tag: 'IPIP-50' },
                  { big: 'Gemini 2.5', small: 'AI 한국어 해석', tag: 'FLASH' },
                  { big: '직업·취미', small: '점수 기반 카드', tag: 'LIFE FIT' },
                  { big: '한 주 실험', small: '구체 행동 제안', tag: 'PRACTICE' },
                  { big: 'OpenAlex', small: '실시간 논문 인용', tag: 'OPEN ACCESS' },
                  { big: '익명', small: '회원가입 없음', tag: 'NO-LOGIN' },
                  { big: '7일 유효', small: '고유 링크', tag: 'BOOKMARK' },
                  { big: '1,500원', small: '런칭 할인가', tag: 'LAUNCH' },
                ].map((s, i) => (
                  <div
                    key={`${loop}-${i}`}
                    className="flex items-baseline gap-4"
                  >
                    <span className="text-2xl lg:text-3xl font-semibold tracking-tight">
                      {s.big}
                    </span>
                    <span className="text-[12px] text-[var(--ink-muted)]">
                      {s.small}
                      <span className="block font-mono text-[10px] tracking-[0.15em] text-[var(--ink-soft)] mt-0.5">
                        {s.tag}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Everything from the "이전 검사 보기" block through the FAQ is wrapped
           in a single .content-paper column. The grain background of the page
           stays visible to the left and right of this card on desktop; inside
           the card the body copy sits on near-opaque white for full legibility. */}
      <div className="content-paper">

      {/* Previous report key lookup — quieter, placed just below the hero. */}
      <section className="max-w-2xl mx-auto px-6 pt-10 pb-8">
        <PreviousReportLookup />
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      {/* 00. CORE SUMMARY — AI 크롤러 앞 30% 존(인용 44%)에 단정적 팩트 배치.
           엔티티 밀도를 일부러 높여두고, 문단 중간에 핵심 숫자·정의를 둔다. */}
      <section
        id="about"
        className="max-w-2xl mx-auto px-6 py-14 sm:py-16"
        aria-labelledby="core-summary-heading"
      >
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          00. 정의
        </p>
        <h2
          id="core-summary-heading"
          className="mt-4 text-2xl sm:text-3xl font-semibold"
        >
          kirok은 무엇인가
        </h2>

        <div className="prose-editorial mt-6 text-[16px] leading-[1.85]">
          <p>
            <strong>kirok(기록)</strong>은 Goldberg(1992)가 공개한{' '}
            <strong>IPIP-50 50문항</strong>을 2026년 저자 개정본으로 재작성한{' '}
            <strong>Big Five 성격검사</strong>입니다. 10분의 응답으로{' '}
            <strong>개방성·성실성·외향성·우호성·신경성</strong> 다섯 가지
            성향이 각각 어느 쪽으로 얼마나 치우쳤는지 수치로 정리되고,{' '}
            <strong>Google Gemini 2.5 Flash</strong>가 한국어 서사형 해석을
            씁니다. <strong>OpenAlex 학술 데이터베이스</strong>에서 요인별
            논문 1~3건을 실시간으로 찾아 본문에 자연스럽게 인용하고, 점수
            조합에서 파생된 <strong>직업 · 취미 카드</strong>와 당신의 상위
            요인에 연결된 <strong>한 주짜리 실험 4~6개</strong>를 리포트 안에
            함께 담습니다.
          </p>
          <p>
            쉽게 말하면, 10분짜리 성격검사에 AI 한국어 해석, 실제 학술 논문
            인용, 결과 기반 직업·취미 제안, 당장 오늘부터 시도해 볼 실험까지
            붙은 익명 리포트를 받는 서비스입니다. 회원가입은 없고, 결제하셔도
            카드 번호는 카카오페이만 알지 저희 서버에는 남지 않습니다.
            리포트는 결제 후 <strong>7일간</strong> 전용 링크로 언제든 다시
            열 수 있고, 링크를 잃어버리셨다면 홈의{' '}
            <strong>이전 검사 보기</strong>에 8자 키를 넣으시면 됩니다.
          </p>
        </div>

        <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-[13px] border-t border-b border-[var(--line)] py-6">
          <div>
            <dt className="text-[10px] tracking-[0.15em] uppercase text-[var(--ink-soft)]">
              검사 도구
            </dt>
            <dd className="mt-1 font-medium">IPIP-50</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.15em] uppercase text-[var(--ink-soft)]">
              출처
            </dt>
            <dd className="mt-1 font-medium">Goldberg, 1992</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.15em] uppercase text-[var(--ink-soft)]">
              측정 요인
            </dt>
            <dd className="mt-1 font-medium">5요인 (연속)</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.15em] uppercase text-[var(--ink-soft)]">
              응답 척도
            </dt>
            <dd className="mt-1 font-medium">Likert 5점</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.15em] uppercase text-[var(--ink-soft)]">
              소요
            </dt>
            <dd className="mt-1 font-medium">약 10분 · 50문항</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.15em] uppercase text-[var(--ink-soft)]">
              AI 해석
            </dt>
            <dd className="mt-1 font-medium">Gemini 2.5 Flash</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.15em] uppercase text-[var(--ink-soft)]">
              논문 인용
            </dt>
            <dd className="mt-1 font-medium">OpenAlex · 실시간</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.15em] uppercase text-[var(--ink-soft)]">
              유효기간
            </dt>
            <dd className="mt-1 font-medium">결제 후 7일</dd>
          </div>
        </dl>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      {/* 01. PAIN HOOK — "이런 적, 한 번쯤은" micro-scenarios that make the
           reader feel "아 내 얘기네" before any product description. */}
      <section className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          01. 순간
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">
          이런 적, 한 번쯤은 있었을 겁니다
        </h2>
        <p className="mt-4 text-[14px] text-[var(--ink-muted)] leading-relaxed max-w-xl">
          평소엔 그냥 지나치다가, 어느 순간 자꾸 떠오르는 장면들이 있어요.
        </p>

        <ul className="mt-10 space-y-6">
          {[
            {
              scene: '회의실',
              body:
                '새 프로젝트 첫 주엔 아이디어가 술술 나왔는데, 셋째 주쯤 같은 회의가 유난히 길게 느껴진 적.',
            },
            {
              scene: '친구와의 저녁',
              body:
                '분위기 맞추는 사이에 내가 하고 싶던 얘기는 결국 못 하고, 집에 오는 길이 조용히 허했던 저녁.',
            },
            {
              scene: '퇴근길',
              body:
                '낮에 누군가 스쳐가듯 던진 한 마디가, 버스 창밖을 보는 내내 머릿속에서 감기던 순간.',
            },
            {
              scene: '혼자 있는 주말',
              body:
                '쉬러 들어왔는데도 마음이 가라앉지 않고, 왜 그런지 말로 설명이 잘 안 되던 오후.',
            },
          ].map((item, i) => (
            <li
              key={i}
              className="flex gap-5 border-l-2 border-[var(--line)] pl-5"
            >
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
                  {item.scene}
                </p>
                <p className="mt-2 prose-editorial text-[15px] leading-relaxed">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-[14px] text-[var(--ink-muted)] leading-relaxed max-w-xl">
          같은 일이 누구에겐 에너지이고 누구에겐 부담인 이유, 어떤 관계는 편하고
          어떤 관계는 소진되는 이유. 대부분의 답은{' '}
          <em>‘내가 원래 그런 사람이라서’</em>에 있어요. 문제는 그{' '}
          <strong className="text-[var(--ink)]">‘원래’</strong>가 구체적으로
          무엇인지, 스스로는 잘 보이지 않는다는 것.
        </p>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      {/* 02. HOW IT WORKS — 4-step timeline. The conversion promise made
           concrete so visitors can picture what they'll get in 10 minutes. */}
      <section className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          02. 10분 뒤
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">
          당신 손에 남는 것
        </h2>
        <p className="mt-4 text-[14px] text-[var(--ink-muted)] leading-relaxed max-w-xl">
          가입도, 카드 번호 저장도 없습니다. 한 번의 10분이 이런 경로로
          움직입니다.
        </p>

        <ol className="mt-12 space-y-10">
          {[
            {
              step: '01',
              eyebrow: '응답',
              title: '50문항 · 약 10분',
              body:
                '구체적 장면으로 재작성된 IPIP-50 문항을 Likert 5점으로 답합니다. 정답은 없고, 떠오르는 대로 누르면 됩니다.',
              icon: '/4-1.png',
              iconAlt: '펜촉과 체크박스 아이콘',
            },
            {
              step: '02',
              eyebrow: '해석',
              title: 'AI가 한국어 서사로 풀어 줍니다',
              body:
                'Gemini 2.5 Flash가 당신의 다섯 점수 조합에서 드러나는 결을 8~10문장의 인물 스케치로, 각 요인은 7~9문장 구체 장면으로 풀어 씁니다. OpenAlex에서 실시간으로 찾은 실제 학술 논문이 본문에 자연스럽게 인용됩니다.',
              icon: '/4-2.png',
              iconAlt: '문서와 반짝임 아이콘',
            },
            {
              step: '03',
              eyebrow: '지도',
              title: '직업 · 취미 카드로 방향을 제시',
              body:
                '상위 두세 개 요인과 맞닿은 직업 4~6개, 취미 4~6개가 적합도 표시와 근거 한 줄이 붙은 카드로 정리됩니다. 보장이 아닌 탐색용 나침반.',
              icon: '/4-3.png',
              iconAlt: '나침반과 갈라진 길 아이콘',
            },
            {
              step: '04',
              eyebrow: '행동',
              title: '이번 주의 실험 + 7일 익명 링크',
              body:
                '“언제·어디서·무엇을·어떻게”가 담긴 한 주짜리 실험 4~6개와, 7일간 유효한 전용 링크가 나옵니다. 8자 키를 저장해 두면 홈에서 언제든 다시 열어볼 수 있어요.',
              icon: '/4-4.png',
              iconAlt: '달력과 화살표 아이콘',
            },
          ].map((s) => (
            <li
              key={s.step}
              className="flex gap-5 sm:gap-6 items-start"
            >
              <div className="shrink-0 flex flex-col items-center gap-3 w-14 sm:w-16">
                <Image
                  src={s.icon}
                  alt={s.iconAlt}
                  width={64}
                  height={64}
                  className="w-12 h-12 sm:w-14 sm:h-14 opacity-80"
                />
                <span className="font-mono text-[10px] text-[var(--ink-soft)]">
                  {s.step}
                </span>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
                  {s.eyebrow}
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-3 prose-editorial text-[14px] leading-relaxed text-[var(--ink-muted)]">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/test/ipip50"
            className="inline-flex items-center justify-center gap-2 text-[14px] font-medium px-6 py-3.5 bg-[var(--ink)] text-white rounded-sm hover:bg-black transition"
          >
            10분 먼저 시작 <span aria-hidden>→</span>
          </Link>
          <span className="text-[12px] text-[var(--ink-soft)]">
            {SALE_PRICE.toLocaleString()}원 · 회원가입 없음
          </span>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      {/* 03. WHY KIROK — condensed merge of "why now" + "why Big Five" into a
           single conversion argument with a clean comparison grid. */}
      <section className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          03. 근거
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">
          왜 MBTI 말고 kirok인가
        </h2>

        <div className="prose-editorial mt-8 text-[15px]">
          <p>
            유형 하나로 사람을 설명하면 편리하지만, 같은 INFP도 누구는 낯선
            사람과 5분이면 말이 트이고 누구는 30분이 지나도 조용합니다. 유형은{' '}
            <strong>이름</strong>을 주지만, 당신의 <strong>강도</strong>는 말해
            주지 못해요.
          </p>
          <p>
            Big Five(5요인 모델)는 성격심리학에서 가장 광범위하게 검증된
            프레임워크입니다. Costa &amp; McCrae의 NEO-PI-R, Goldberg의 Big-Five
            Factor Markers 이후 수천 편의 후속 연구에서 직업 성과·관계
            만족도·정신건강 지표와의 연관이 반복적으로 확인돼 왔습니다. 이 사이트는
            Goldberg(1992)가 공개 도메인으로 제공하는 IPIP-50을 2026년 개정본으로
            사용합니다.
          </p>
        </div>

        <div className="mt-10 border border-[var(--line)] divide-y divide-[var(--line)] sm:divide-y-0 sm:divide-x sm:grid sm:grid-cols-2">
          <div className="p-6">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
              MBTI 유형 결과
            </p>
            <ul className="mt-4 space-y-3 text-[13px] text-[var(--ink-muted)] leading-relaxed">
              <li>16개 유형 중 하나로 압축</li>
              <li>같은 유형끼리의 차이는 설명 못 함</li>
              <li>학술 재검사 신뢰도 논쟁 지속</li>
              <li>대개 상업 컨설팅·온라인 밈 기반</li>
            </ul>
          </div>
          <div className="p-6 bg-[var(--line-soft)]">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
              kirok · Big Five 백분위
            </p>
            <ul className="mt-4 space-y-3 text-[13px] text-[var(--ink)] leading-relaxed">
              <li>다섯 성향이 각각 어느 쪽으로 얼마나 강한지</li>
              <li>같은 경향끼리도 강도까지 비교</li>
              <li>수천 편의 후속 연구로 검증된 모델</li>
              <li>실제 OpenAlex 학술 논문이 본문에 인용</li>
            </ul>
          </div>
        </div>

        <p className="mt-8 text-xs text-[var(--ink-soft)] leading-relaxed">
          Goldberg, L. R. (1992). The development of markers for the Big-Five
          factor structure. <em>Psychological Assessment, 4</em>(1), 26–42.
        </p>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      {/* 04. WHAT YOU GET */}
      <section className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          04. 리포트
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">
          결과에 담기는 것
        </h2>
        <p className="mt-4 text-[14px] text-[var(--ink-muted)] leading-relaxed max-w-xl">
          유형 하나를 받는 대신, 나를 여섯 각도에서 본 한 권의 책을 받는 느낌에
          가깝습니다.
        </p>
        <ul className="mt-10 space-y-6 text-[15px]">
          <li className="flex items-baseline gap-4">
            <span className="text-[var(--ink-soft)] text-xs w-6 shrink-0">
              01
            </span>
            <div>
              <div className="font-medium">
                다섯 성향의 백분위와 레이더 차트
              </div>
              <div className="mt-1 text-[13px] text-[var(--ink-muted)] leading-relaxed">
                같은 또래 규준과 비교해 어느 쪽으로 얼마나 치우쳤는지 한 장에
                담아 드립니다. 숫자 대신 “상위권 · 평균 근처 · 하위 20% 내외”
                같은 자연어 레벨도 함께.
              </div>
            </div>
          </li>
          <li className="flex items-baseline gap-4">
            <span className="text-[var(--ink-soft)] text-xs w-6 shrink-0">
              02
            </span>
            <div>
              <div className="font-medium">서사형 전체 요약 + 요인별 깊은 해석</div>
              <div className="mt-1 text-[13px] text-[var(--ink-muted)] leading-relaxed">
                이 점수 조합에서 드러나는 “당신 특유의 결”을 한 인물 스케치처럼
                8~10문장으로 풀고, 다섯 요인은 각각 7~9문장으로 회의실·친구
                저녁·혼자 있는 주말 같은 구체 장면에 비춰 설명합니다. 강점만
                늘어놓지 않고 사각지대까지 담습니다.
              </div>
            </div>
          </li>
          <li className="flex items-baseline gap-4">
            <span className="text-[var(--ink-soft)] text-xs w-6 shrink-0">
              03
            </span>
            <div>
              <div className="font-medium">
                점수 조합에서 파생된 직업 · 취미 카드
              </div>
              <div className="mt-1 text-[13px] text-[var(--ink-muted)] leading-relaxed">
                상위 요인 두세 개에 맞닿은 직업 4~6개, 취미 4~6개를 적합도 표시와
                함께 카드로. 각 카드에는 “왜 당신의 점수 벡터에 맞는지” 한 줄
                근거가 붙습니다. 직업 보장이 아닌 방향 탐색용 나침반입니다.
              </div>
            </div>
          </li>
          <li className="flex items-baseline gap-4">
            <span className="text-[var(--ink-soft)] text-xs w-6 shrink-0">
              04
            </span>
            <div>
              <div className="font-medium">
                당신의 요인과 연결된 한 주짜리 실험 4~6개
              </div>
              <div className="mt-1 text-[13px] text-[var(--ink-muted)] leading-relaxed">
                “언제 · 어디서 · 무엇을 · 어떻게” 네 요소를 담은 실행 가능한
                문장. 각 실험에는 요인 배지와 “왜 당신에게 이 실험인지” 한 줄
                근거가 붙어, 추상적 조언이 아닌 이번 주의 구체 행동으로
                이어집니다.
              </div>
            </div>
          </li>
          <li className="flex items-baseline gap-4">
            <span className="text-[var(--ink-soft)] text-xs w-6 shrink-0">
              05
            </span>
            <div>
              <div className="font-medium">
                OpenAlex에서 실시간으로 찾은 학술 논문 인용
              </div>
              <div className="mt-1 text-[13px] text-[var(--ink-muted)] leading-relaxed">
                AI가 지어낸 가짜 인용이 아니라, 해석 중 요인별로 검색된 실제
                논문 1~3건만 자연스럽게 녹여 씁니다. 제목과 링크는 리포트 하단에
                정리됩니다.
              </div>
            </div>
          </li>
          <li className="flex items-baseline gap-4">
            <span className="text-[var(--ink-soft)] text-xs w-6 shrink-0">
              06
            </span>
            <div>
              <div className="font-medium">7일간 유효한 익명 리포트 링크</div>
              <div className="mt-1 text-[13px] text-[var(--ink-muted)] leading-relaxed">
                계정 없이 링크와 8자 리포트 키 하나로 언제든 다시 열람. 브라우저
                인쇄 창에서 PDF로 저장하면 페이지 경계에서 카드가 찢기지 않게
                정돈되어 내려옵니다.
              </div>
            </div>
          </li>
        </ul>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      {/* 05. REPORT PREVIEW — miniature of the actual report so visitors can
           feel the shape before paying. All content here is illustrative. */}
      <section className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          05. 미리보기
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">
          리포트 안을 들여다보면
        </h2>
        <p className="mt-4 text-[14px] text-[var(--ink-muted)] leading-relaxed max-w-xl">
          아래는 실제 리포트의 축소판 예시입니다. 가상의 프로파일을 기반으로 한
          샘플이며, 진짜 리포트는 당신의 50문항 응답을 토대로 생성됩니다.
        </p>

        <div className="mt-10 border border-[var(--line)] bg-[var(--line-soft)] p-6 sm:p-8 space-y-10">
          {/* Sample overall snippet */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
              Overview · 예시
            </p>
            <p className="mt-3 prose-editorial text-[15px] leading-[1.85]">
              새 프로젝트 첫 주엔 아이디어를 꺼내는 속도로 자리를 데우지만,
              반복 업무가 누적되는 셋째 주가 오면 같은 방식이 피로로 바뀌는
              사람입니다. 낯선 자리에서는 먼저 말을 걸기보다 분위기를 먼저
              읽고, 한 명과 깊은 대화가 트이면 거기서 에너지가 충전되는
              쪽입니다.
            </p>
          </div>

          {/* Sample factor card */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
              Factors · 예시 한 요인
            </p>
            <article className="mt-3">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-[var(--ink-soft)]">
                    01
                  </span>
                  <h3 className="text-lg font-semibold">개방성</h3>
                </div>
                <div className="text-sm text-[var(--ink-muted)]">
                  <span className="font-mono">82</span>
                  <span className="ml-2 text-[11px] text-[var(--ink-soft)] uppercase tracking-wider">
                    상위권
                  </span>
                </div>
              </div>
              <div className="mt-3 h-px bg-[var(--line)] relative">
                <div
                  className="absolute inset-y-0 left-0 h-px bg-[var(--ink)]"
                  style={{ width: '82%' }}
                  aria-hidden
                />
              </div>
              <p className="mt-4 prose-editorial text-[14px] leading-relaxed">
                익숙한 길을 걸으면서도 머릿속에서는 “만약에”로 시작하는
                장면이 길게 이어집니다. 회의 중 하나의 주제에서 두세 갈래가
                이미 뻗어나가 있어 팀원들이 속도 맞추기 어려울 때가 있습니다.
                이런 기질은 새 포맷을 기획하는 자리에서 빛나지만, 같은 운영
                업무가 넷째 주를 넘길 때 에너지가 먼저 가라앉는 지점이기도
                합니다.
              </p>
            </article>
          </div>

          {/* Sample Life Fit cards */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
              Life Fit · 예시 두 장
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <article className="border border-[var(--line)] bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-[14px] font-semibold leading-tight">
                    UX 리서처
                  </h4>
                  <span className="font-mono text-[10px] tracking-widest text-[var(--ink-soft)] leading-none pt-1">
                    ●●●●●
                  </span>
                </div>
                <p className="mt-2 text-[12px] text-[var(--ink-muted)] leading-relaxed">
                  개방성 82 · 친화성 70 조합이라 깊은 인터뷰에서 상대의 결을
                  읽는 자리가 가장 빛나는 역할이에요.
                </p>
              </article>
              <article className="border border-[var(--line)] bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-[14px] font-semibold leading-tight">
                    브랜드 전략 컨설턴트
                  </h4>
                  <span className="font-mono text-[10px] tracking-widest text-[var(--ink-soft)] leading-none pt-1">
                    ●●●●
                    <span className="opacity-25">●</span>
                  </span>
                </div>
                <p className="mt-2 text-[12px] text-[var(--ink-muted)] leading-relaxed">
                  구조보다 아이디어 발굴에 먼저 붙어야 에너지가 살아나는 쪽이라,
                  초반 팀에 더 맞습니다.
                </p>
              </article>
            </div>
          </div>

          {/* Sample Practice item */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
              Practice · 이번 주 실험 예시
            </p>
            <div className="mt-3 flex gap-4">
              <span className="font-mono text-xs text-[var(--ink-soft)] pt-1">
                01
              </span>
              <div className="flex-1">
                <span className="inline-block mb-2 px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase border border-[var(--line)] text-[var(--ink-soft)]">
                  개방성
                </span>
                <p className="prose-editorial text-[14px]">
                  수요일 퇴근 후 30분, 스마트폰을 다른 방에 두고 평소 피하던
                  주제 하나를 노트에 두 문단 써 보세요.
                </p>
                <p className="mt-2 pl-3 border-l border-[var(--line)] text-[12px] text-[var(--ink-muted)] leading-relaxed">
                  왜 당신에게? 개방성이 상위권이라 언어로 풀어내는 실험이
                  에너지가 되는 쪽입니다.
                </p>
              </div>
            </div>
          </div>

          {/* Sample citation */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
              Cited · 예시 인용
            </p>
            <p className="mt-3 text-[13px] leading-snug">
              <span className="underline underline-offset-4 decoration-[var(--line)]">
                Openness to experience and creative achievement
              </span>
              <span className="ml-1 text-[11px] text-[var(--ink-soft)]">
                (Kaufman et al., 2016)
              </span>
            </p>
            <p className="mt-2 text-[11px] text-[var(--ink-soft)] leading-relaxed">
              실제 리포트에서는 이런 논문이 본문 안에 자연스럽게 녹아 들어가고,
              하단에 링크가 함께 정리됩니다.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      {/* Mid-scroll CTA — placed after the preview so the offer lands at peak
           intent, before the pricing/FAQ reading-heavy sections. */}
      <section className="max-w-2xl mx-auto px-6 py-10">
        <div className="relative overflow-hidden border border-[var(--ink)] bg-[var(--ink)] text-white p-7 sm:p-9">
          <p className="text-[10px] tracking-[0.25em] uppercase text-white/60">
            Now · {SALE_PRICE.toLocaleString()}원 · 10분
          </p>
          <h3 className="mt-3 text-2xl sm:text-3xl font-semibold leading-tight tracking-tight">
            읽는 건 여기까지.
            <br />
            나머지 10분은 직접 해 보는 게 빠릅니다.
          </h3>
          <p className="mt-4 text-[13px] text-white/70 leading-relaxed max-w-md">
            회원가입 없이 바로 시작. 결제 후 7일간 유효한 익명 리포트를
            받습니다.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/test/ipip50"
              className="inline-flex items-center justify-center gap-2 text-[14px] font-medium px-6 py-3.5 bg-white text-[var(--ink)] rounded-sm hover:bg-white/90 transition"
            >
              지금 검사 시작 <span aria-hidden>→</span>
            </Link>
            <span className="text-[11px] text-white/60">
              AI 해석 · 논문 인용 · 직업·취미 카드 · 한 주짜리 실험
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      {/* 06. PRICE */}
      <section id="price" className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          06. 가격
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">
          왜 {SALE_PRICE.toLocaleString()}원인가
        </h2>
        <div className="prose-editorial mt-8 text-[15px]">
          <p>
            시중 유료 성격검사는 대개 1~3만원입니다. 그 가격이 부담스러워
            검사를 미루거나, 출처가 불분명한 무료 버전으로 대신하는 경우를
            자주 봤습니다.
          </p>
          <p>
            이 사이트는 <strong>구독도, 광고도, 회원가입도 없는 1회용 검사</strong>
            입니다. 결제 수수료와 AI 호출 비용만 회수하면 되는 구조이기 때문에,
            커피 한 잔 값에 맞출 수 있습니다.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-0 border-t border-b border-[var(--line)]">
          <div className="py-5 pr-6 border-r border-[var(--line)]">
            <div className="text-xs text-[var(--ink-soft)]">시중 유료 검사</div>
            <div className="mt-2 text-xl font-semibold">10,000 ~ 30,000원</div>
            <div className="mt-1 text-xs text-[var(--ink-soft)]">
              종이 / PDF 리포트
            </div>
          </div>
          <div className="py-5 pl-6">
            <div className="text-xs text-[var(--ink-soft)]">kirok</div>
            <div className="mt-2 text-xl font-semibold">
              {SALE_PRICE.toLocaleString()}원{' '}
              <span className="text-[var(--ink-soft)] line-through ml-1 text-base font-normal">
                {ANCHOR_PRICE.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 text-xs text-[var(--ink-soft)]">
              AI 해석 + 실제 논문 인용
            </div>
          </div>
        </div>

        <div className="mt-8 border border-[var(--line)] bg-[var(--line-soft)] px-5 py-4">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            현재 가격에 대한 안내
          </p>
          <p className="mt-2 text-[14px] text-[var(--ink)] leading-relaxed">
            <strong>{SALE_PRICE.toLocaleString()}원은 초기 운영 가격</strong>입니다.
            AI 모델(Gemini) 호출 단가가 상승하면 원가인{' '}
            <strong>{ANCHOR_PRICE.toLocaleString()}원</strong>으로 복귀합니다.
            지금 가격일 때 먼저 받아 두시길 권합니다.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      {/* 07. FAQ */}
      <section className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          07. FAQ
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">자주 묻는 질문</h2>
        <dl className="mt-10 divide-y divide-[var(--line)]">
          <div className="py-6">
            <dt className="font-semibold text-[15px]">
              MBTI 결과랑은 어떻게 다른가요?
            </dt>
            <dd className="mt-2 prose-editorial text-[14px]">
              MBTI는 사람을 16개 유형 중 하나로 분류합니다. 같은 INFP라도
              사람마다 실제 성격은 꽤 다르죠. Big Five는 유형을 붙이는 대신{' '}
              <strong>다섯 가지 성향이 각각 얼마나 강한지</strong>를 숫자로
              보여 줍니다. 그래서 같은 특성을 가진 사람끼리도 누가 더 강한
              편인지까지 구분할 수 있어요. 학술 쪽에서는 Big Five의 재검사
              신뢰도와 예측 타당도가 MBTI보다 일관되게 높다고 보고됩니다.
            </dd>
          </div>
          <div className="py-6">
            <dt className="font-semibold text-[15px]">익명인가요?</dt>
            <dd className="mt-2 prose-editorial text-[14px]">
              회원가입이 없어요. 시작 전에 리포트에 표시할 <strong>닉네임</strong>과{' '}
              <strong>성별·나이대</strong>만 수집하며(모두 “미응답” 선택 가능),
              실명·이메일·전화번호는 저장하지 않습니다. 결제 시점엔
              카카오페이가 결제 정보를 처리할 뿐 본 사이트에는 카드 번호가 남지 않아요.
            </dd>
          </div>
          <div className="py-6">
            <dt className="font-semibold text-[15px]">
              리포트는 어디에 저장되나요?
            </dt>
            <dd className="mt-2 prose-editorial text-[14px]">
              결제 후 받는 7일짜리 고유 링크로만 접근할 수 있어요. 링크를
              잃어버리면 복구가 어려우니 북마크해 주세요.
            </dd>
          </div>
          <div className="py-6">
            <dt className="font-semibold text-[15px]">AI 해석이 정확한가요?</dt>
            <dd className="mt-2 prose-editorial text-[14px]">
              AI는 점수 패턴을 한국어 문장으로 풀어 주는 보조 도구이며, 임상
              진단은 아닙니다. 인용되는 논문은 AI가 지어내지 않고 OpenAlex에서
              실제로 검색한 결과만 붙입니다.
            </dd>
          </div>
          <div className="py-6">
            <dt className="font-semibold text-[15px]">
              직업 · 취미 추천은 어떻게 만들어지나요?
            </dt>
            <dd className="mt-2 prose-editorial text-[14px]">
              다섯 요인의 <strong>조합</strong>을 기준으로 상위 두세 개 요인과
              맞닿은 직업 4~6개, 취미 4~6개를 적합도(●●●●●) 표시와 함께 카드로
              제시합니다. 개방성·성실성 같은 단일 요인이 직무 성과에 미치는
              영향을 다룬 성격심리학 매핑(예: Barrick &amp; Mount, 1991)을
              프롬프트에 주입하되, “당신은 반드시 ~에 적합” 같은 보장 표현은
              금지합니다. 정답이 아니라 방향 탐색용 나침반입니다.
            </dd>
          </div>
          <div className="py-6">
            <dt className="font-semibold text-[15px]">
              한 주짜리 실험은 어떻게 고르나요?
            </dt>
            <dd className="mt-2 prose-editorial text-[14px]">
              <strong>“언제 · 어디서 · 무엇을 · 어떻게”</strong> 네 요소를
              담은 실행 가능한 문장만 4~6개 제시하고, 각 실험에는 이 제안이
              어느 요인과 맞닿아 있는지 <strong>요인 배지</strong>와 “왜
              당신에게 이 실험인지” 한 줄 근거가 붙습니다. “자주 ~하세요” 같은
              추상적 조언은 배제됩니다.
            </dd>
          </div>
        </dl>

        <div className="mt-16 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <Link
            href="/test/ipip50"
            className="inline-flex items-center justify-center gap-2 text-[15px] font-medium px-8 py-4 bg-[var(--ink)] text-white rounded-sm hover:bg-black transition"
          >
            검사 시작 <span aria-hidden>→</span>
          </Link>
          <span className="text-xs text-[var(--ink-soft)]">
            10분 · {SALE_PRICE.toLocaleString()}원
          </span>
        </div>
      </section>

      </div>
    </main>
  )
}
