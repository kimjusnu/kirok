import Link from 'next/link'

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
        text: 'MBTI는 16개 유형 중 하나로 사람을 분류합니다. 같은 INFP 안에서도 사람마다 실제 성격은 크게 다릅니다. Big Five는 유형이 아니라 다섯 개 축에서의 연속 점수로 표시하기 때문에, 같은 축에서도 상위 10%인지 상위 40%인지에 따라 전혀 다른 특성으로 나타납니다. 학술적으로는 Big Five의 재검사 신뢰도와 예측 타당도가 MBTI보다 일관되게 높다고 보고됩니다.',
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

      {/* HERO */}
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          성격검사 · Big Five 모델
        </p>
        <h1 className="mt-6 text-[44px] sm:text-[60px] font-bold leading-[1.05] tracking-tight">
          유형이 아닌,
          <br />
          축으로 보는 나.
        </h1>
        <span className="rule mt-8" aria-hidden />
        <p className="prose-editorial mt-8 text-[17px]">
          MBTI가 사람을 16개의 상자에 나눠 담는다면, Big Five는 다섯 개의 축
          위에서 당신의 위치를 백분위로 보여 줍니다. 같은 유형 안에서도 사람이
          서로 다른 이유는, 원래 성격이 유형이 아니라{' '}
          <strong>축의 조합</strong>이기 때문입니다.
        </p>
        <p className="prose-editorial mt-5 text-[15px] text-[var(--ink-muted)]">
          10분의 50문항, AI가 써 주는 한국어 해석, 그리고 진짜 학술 논문 링크가
          붙은 익명 리포트 — 커피 한 잔 값에.
        </p>

        <dl className="mt-12 grid grid-cols-3 gap-6 text-sm border-t border-b border-[var(--line)] py-6">
          <div>
            <dt className="text-[var(--ink-soft)] text-xs">소요</dt>
            <dd className="mt-1 font-medium">10분</dd>
          </div>
          <div>
            <dt className="text-[var(--ink-soft)] text-xs">문항</dt>
            <dd className="mt-1 font-medium">50개</dd>
          </div>
          <div>
            <dt className="text-[var(--ink-soft)] text-xs">가격</dt>
            <dd className="mt-1 font-medium">
              {SALE_PRICE.toLocaleString()}원{' '}
              <span className="text-[var(--ink-soft)] line-through ml-1 font-normal">
                {ANCHOR_PRICE.toLocaleString()}
              </span>
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          <Link
            href="/test/ipip50"
            className="inline-flex items-center justify-center w-full sm:w-auto gap-2 text-[15px] font-medium px-8 py-4 bg-[var(--ink)] text-white rounded-sm hover:bg-black transition"
          >
            검사 시작 <span aria-hidden>→</span>
          </Link>
          <p className="mt-3 text-xs text-[var(--ink-soft)]">
            회원가입 없음 · 쿠폰 있으면 0원 · 리포트는 7일 유효
          </p>
        </div>
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
            대부분의 답은 <em>‘내가 원래 그런 사람이라서’</em>에 있습니다.
            문제는 그 ‘원래’가 구체적으로 무엇인지, 스스로는 잘 보이지
            않는다는 점입니다. 가까운 사람이 “너 좀 그런 편이잖아”라고 말할
            때, 반박도 수긍도 애매한 이유입니다.
          </p>
          <p>
            성격 축 위의 내 위치를 숫자로 확인하면, 지금까지 막연하게 ‘그냥
            그런 거’였던 패턴이 처음으로 언어가 됩니다. 유형 이름보다 정확한
            자기 설명이 생기고, 그때부터 어떤 일에 에너지를 쓰고 어떤 일은
            피해야 할지 판단이 조금 더 선명해집니다.
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
            논문 안에서 검증을 거쳐 온 모델입니다. 유형을 붙여 주는 대신 다섯
            개의 축에서 각자의 위치를 알려 주기 때문에, 한 사람을 16분의 1로
            압축하지 않고 그대로 설명할 수 있습니다.
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
              <div className="font-medium">5요인 점수·백분위·레이더 차트</div>
              <div className="mt-1 text-[13px] text-[var(--ink-muted)]">
                같은 또래와 비교했을 때의 상대 위치까지 한 장에.
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
            이 사이트는 <strong>구독도, 광고도, 회원가입도 없는 1회용 검사</strong>입니다.
            결제 수수료와 AI 호출 비용만 회수하면 되는 구조이기 때문에, 커피
            한 잔 값에 맞출 수 있습니다. 쿠폰이 있다면 결제 단계에서 0원으로
            처리됩니다.
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
              MBTI는 16개 유형 중 하나로 분류합니다. 같은 INFP 안에서도
              사람마다 실제 성격은 크게 다르죠. Big Five는 유형이 아니라 다섯
              개 축의 <strong>연속 점수</strong>로 표시하기 때문에, 같은 축에서도
              상위 10%인지 40%인지에 따라 전혀 다른 특성으로 나타납니다. 학술
              쪽에서는 Big Five의 재검사 신뢰도와 예측 타당도가 MBTI보다
              일관되게 높다고 보고됩니다.
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
            10분 · {SALE_PRICE.toLocaleString()}원 · 쿠폰 있으면 0원
          </span>
        </div>
      </section>
    </main>
  )
}
