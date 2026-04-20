import Link from 'next/link'

const ANCHOR_PRICE = 9900
const SALE_PRICE = 1500

export default function HomePage() {
  return (
    <main>
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          IPIP Big-Five · 50 Items
        </p>
        <h1 className="mt-6 text-5xl sm:text-[64px] font-bold leading-[1.05] tracking-tight">
          Big Five,
          <br />
          decoded.
        </h1>
        <span className="rule mt-8" aria-hidden />
        <p className="prose-editorial mt-8 text-[17px]">
          10분, 50문항. 5요인 백분위와 요인별 해석, 그리고 OpenAlex에서 실시간으로
          가져온 학술 논문 링크가 붙은 리포트가 나옵니다. 유형으로 가두지 않고,
          다섯 개 축 위 당신의 위치를 보여 줍니다.
        </p>

        <div className="mt-10 flex items-baseline gap-5">
          <Link
            href="/test/ipip50"
            className="text-sm font-medium px-5 py-3 bg-[var(--ink)] text-white rounded-sm hover:bg-black transition"
          >
            검사 시작 →
          </Link>
          <a href="#why" className="text-sm text-[var(--ink-muted)] link-underline">
            왜 1,500원
          </a>
        </div>

        <dl className="mt-16 grid grid-cols-3 gap-6 text-sm">
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
              1,500원{' '}
              <span className="text-[var(--ink-soft)] line-through ml-1 font-normal">
                {ANCHOR_PRICE.toLocaleString()}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      <section id="why" className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          01. 가격
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">
          커피 한 잔 값에 맞춘 이유
        </h2>
        <div className="prose-editorial mt-8 text-[15px]">
          <p>
            시중 유료 검사는 보통 1–3만원. 그 가격이 부담스러워 검사를 미루거나,
            조악한 무료 버전으로 대신하는 경우를 자주 봤습니다.
          </p>
          <p>
            이 사이트의 인프라는 Vercel·Supabase·Gemini의 무료 티어 안에서 돕니다.
            결제 수수료와 모델 호출 비용만 회수하면 되어서 {SALE_PRICE.toLocaleString()}원이
            가능합니다. 쿠폰이 있다면 결제 단계에서 0원 처리됩니다.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-0 border-t border-b border-[var(--line)]">
          <div className="py-5 pr-6 border-r border-[var(--line)]">
            <div className="text-xs text-[var(--ink-soft)]">시중 평균</div>
            <div className="mt-2 text-xl font-semibold">12,000원</div>
            <div className="mt-1 text-xs text-[var(--ink-soft)]">종이 / PDF 리포트</div>
          </div>
          <div className="py-5 pl-6">
            <div className="text-xs text-[var(--ink-soft)]">kirok</div>
            <div className="mt-2 text-xl font-semibold">1,500원</div>
            <div className="mt-1 text-xs text-[var(--ink-soft)]">AI 해석 + 논문 인용</div>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      <section className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          02. 리포트
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">
          결과에 담기는 것
        </h2>
        <ul className="mt-8 space-y-4 text-[15px]">
          <li className="flex items-baseline gap-3">
            <span className="text-[var(--ink-soft)] text-xs w-6">01</span>
            5요인 점수·백분위·레이더 차트
          </li>
          <li className="flex items-baseline gap-3">
            <span className="text-[var(--ink-soft)] text-xs w-6">02</span>
            요인별 한국어 해석 (균형 있는 장·단점)
          </li>
          <li className="flex items-baseline gap-3">
            <span className="text-[var(--ink-soft)] text-xs w-6">03</span>
            OpenAlex에서 찾은 학술 논문 링크
          </li>
          <li className="flex items-baseline gap-3">
            <span className="text-[var(--ink-soft)] text-xs w-6">04</span>
            7일간 유효한 익명 리포트 링크
          </li>
        </ul>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      <section className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          03. 배경
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">
          왜 Big Five인가
        </h2>
        <div className="prose-editorial mt-8 text-[15px]">
          <p>
            Big Five(5요인 모델)는 성격심리학에서 가장 광범위하게 검증된 프레임워크
            중 하나입니다. Costa &amp; McCrae의 NEO-PI-R, Goldberg의 Big-Five Factor
            Markers 이후 수천 편의 후속 연구에서 직업 성과, 관계 만족도, 정신건강
            지표와의 연관이 반복적으로 확인되어 왔습니다.
          </p>
          <p>
            이 사이트는 Goldberg(1992)가 공개 도메인으로 제공하는 IPIP-50을
            사용합니다. MBTI처럼 유형으로 나누지 않고, 5개 축에서 각자의 위치를
            백분위로 보여 줍니다.
          </p>
        </div>
        <p className="mt-8 text-xs text-[var(--ink-soft)] leading-relaxed">
          Goldberg, L. R. (1992). The development of markers for the Big-Five factor
          structure. <em>Psychological Assessment, 4</em>(1), 26–42.
        </p>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <span className="rule-full" aria-hidden />
      </div>

      <section className="max-w-2xl mx-auto px-6 py-20 sm:py-24">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          04. FAQ
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">자주 묻는 질문</h2>
        <dl className="mt-10 divide-y divide-[var(--line)]">
          <div className="py-6">
            <dt className="font-semibold text-[15px]">익명인가요?</dt>
            <dd className="mt-2 prose-editorial text-[14px]">
              회원가입이 없어요. 시작 전에 리포트에 표시할 <strong>닉네임</strong>
              과 <strong>성별·나이대</strong>만 수집하며(모두 "미응답" 선택 가능),
              실명·이메일·전화번호는 저장하지 않습니다. 결제 시점엔 토스페이먼츠가
              카드 정보를 처리할 뿐 본 사이트에는 남지 않아요.
            </dd>
          </div>
          <div className="py-6">
            <dt className="font-semibold text-[15px]">리포트는 어디에 저장되나요?</dt>
            <dd className="mt-2 prose-editorial text-[14px]">
              결제 후 받는 7일짜리 고유 링크로만 접근할 수 있어요. 링크를 잃어버리면
              복구가 어려우니 북마크해 주세요.
            </dd>
          </div>
          <div className="py-6">
            <dt className="font-semibold text-[15px]">AI 해석이 정확한가요?</dt>
            <dd className="mt-2 prose-editorial text-[14px]">
              AI는 점수 패턴을 언어로 풀어 주는 보조 도구이며, 임상 진단은 아닙니다.
              인용되는 논문은 AI가 만들어내지 않고 OpenAlex에서 실제로 검색한
              결과만 붙입니다.
            </dd>
          </div>
        </dl>

        <div className="mt-16">
          <Link
            href="/test/ipip50"
            className="inline-flex items-center gap-2 text-sm font-medium px-5 py-3 bg-[var(--ink)] text-white rounded-sm hover:bg-black transition"
          >
            검사 시작 <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
