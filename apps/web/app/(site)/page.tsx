import Link from 'next/link'
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
                    익명으로 10분, 리포트는 7일간 곁에.
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
            <strong>IPIP-50 50문항</strong>을 그대로 사용한{' '}
            <strong>Big Five 성격검사</strong>입니다. 10분의 응답으로{' '}
            <strong>개방성·성실성·외향성·우호성·신경성</strong> 다섯 가지
            성향이 각각 어느 쪽으로 얼마나 치우쳤는지 수치로 정리되고,{' '}
            <strong>Google Gemini 2.5 Flash</strong>가 한국어 서사형 해석을
            쓰며, <strong>OpenAlex 학술 데이터베이스</strong>에서 요인별 논문
            1~3건을 실시간으로 찾아 본문에 자연스럽게 인용합니다.
          </p>
          <p>
            쉽게 말하면, 10분짜리 성격검사에 AI 해석과 학술 논문 인용이 붙은
            익명 리포트를 받는 서비스입니다. 회원가입은 없고, 결제하셔도 카드
            번호는 카카오페이만 알지 저희 서버에는 남지 않습니다. 리포트는
            결제 후 <strong>7일간</strong> 전용 링크로 언제든 다시 열 수 있고,
            링크를 잃어버리셨다면 홈의{' '}
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

      {/* 01. WHY YOU */}
      <section className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          01. 이유
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">
          왜 지금, 나를 알아야 할까
        </h2>
        <div className="prose-editorial mt-8 text-[15px]">
          <p>
            같은 일이 왜 누구에겐 에너지이고 나에겐 부담인지. 왜 어떤 관계는
            편하고 어떤 관계는 소진되는지. 왜 매번 비슷한 선택을 반복하는지.
          </p>
          <p>
            대부분의 답은 <em>‘내가 원래 그런 사람이라서’</em> 에 있습니다.
            문제는 그 ‘원래’ 가 구체적으로 무엇인지, 스스로는 잘 보이지
            않는다는 점입니다. 가까운 사람이 “너 좀 그런 편이잖아” 라고 말할
            때, 반박도 수긍도 애매한 이유입니다.
          </p>
          <p>
            다섯 가지 성향이 내 안에서 얼마나 강한지를 숫자로 확인하면, 지금까지
            막연하게 ‘그냥 그런 거’ 였던 패턴이 처음으로 말이 됩니다. 유형
            이름보다 한 걸음 더 구체적인 자기 설명이 생기고, 그때부터 어떤
            일에 에너지를 쓰고 어떤 일은 피해야 할지 판단이 조금 더
            선명해집니다.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      {/* 02. WHY BIG FIVE */}
      <section className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          02. 근거
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">
          왜 MBTI가 아니라 Big Five인가
        </h2>
        <div className="prose-editorial mt-8 text-[15px]">
          <p>
            Big Five(5요인 모델)는 성격심리학에서 가장 광범위하게 검증된
            프레임워크 중 하나입니다. Costa &amp; McCrae의 NEO-PI-R, Goldberg의
            Big-Five Factor Markers 이후 수천 편의 후속 연구에서 직업 성과,
            관계 만족도, 정신건강 지표와의 연관이 반복적으로 확인되어 왔습니다.
          </p>
          <p>
            MBTI가 주로 상업 컨설팅과 온라인 밈으로 퍼진 반면, Big Five는 학술
            논문 안에서 검증을 거쳐 온 모델입니다. 유형 하나로 묶는 대신 다섯
            가지 성향이 내 안에서 각각 얼마나 강한지 알려 주기 때문에, 한
            사람을 16분의 1로 압축하지 않고 있는 그대로 설명할 수 있습니다.
          </p>
          <p>
            이 사이트는 Goldberg(1992)가 공개 도메인으로 제공하는 IPIP-50을
            사용합니다. 학술 문헌에서 오랫동안 쓰여 온 바로 그 문항입니다.
          </p>
        </div>
        <p className="mt-8 text-xs text-[var(--ink-soft)] leading-relaxed">
          Goldberg, L. R. (1992). The development of markers for the Big-Five
          factor structure. <em>Psychological Assessment, 4</em>(1), 26–42.
        </p>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      {/* 03. WHAT YOU GET */}
      <section className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          03. 리포트
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">
          결과에 담기는 것
        </h2>
        <ul className="mt-8 space-y-5 text-[15px]">
          <li className="flex items-baseline gap-4">
            <span className="text-[var(--ink-soft)] text-xs w-6 shrink-0">
              01
            </span>
            <div>
              <div className="font-medium">
                다섯 가지 성향 점수와 레이더 차트
              </div>
              <div className="mt-1 text-[13px] text-[var(--ink-muted)]">
                같은 또래와 비교했을 때 어느 쪽으로 얼마나 치우쳤는지 한 장에
                담아 드립니다.
              </div>
            </div>
          </li>
          <li className="flex items-baseline gap-4">
            <span className="text-[var(--ink-soft)] text-xs w-6 shrink-0">
              02
            </span>
            <div>
              <div className="font-medium">요인별 한국어 해석</div>
              <div className="mt-1 text-[13px] text-[var(--ink-muted)]">
                장점만 늘어놓지 않고, 그 성향이 갖는 비용과 주의점까지.
              </div>
            </div>
          </li>
          <li className="flex items-baseline gap-4">
            <span className="text-[var(--ink-soft)] text-xs w-6 shrink-0">
              03
            </span>
            <div>
              <div className="font-medium">
                OpenAlex에서 실시간으로 찾은 학술 논문 링크
              </div>
              <div className="mt-1 text-[13px] text-[var(--ink-muted)]">
                AI가 지어낸 인용이 아니라, 검색된 실제 논문만 붙습니다.
              </div>
            </div>
          </li>
          <li className="flex items-baseline gap-4">
            <span className="text-[var(--ink-soft)] text-xs w-6 shrink-0">
              04
            </span>
            <div>
              <div className="font-medium">7일간 유효한 익명 리포트 링크</div>
              <div className="mt-1 text-[13px] text-[var(--ink-muted)]">
                계정이 없어도 링크 하나로 언제든 다시 열람.
              </div>
            </div>
          </li>
        </ul>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      {/* 04. PRICE */}
      <section id="price" className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          04. 가격
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

      {/* 05. FAQ */}
      <section className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          05. FAQ
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
    </main>
  )
}
