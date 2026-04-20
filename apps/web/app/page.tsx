import Link from 'next/link'

const ANCHOR_PRICE = 9900
const SALE_PRICE = 1500
const DISCOUNT_PCT = Math.round(((ANCHOR_PRICE - SALE_PRICE) / ANCHOR_PRICE) * 100)

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-2xl mx-auto px-6 py-16 sm:py-24">
        <p className="text-xs tracking-wider text-gray-500 uppercase">
          Big Five · 논문 기반 · 익명
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight">
          커피 한 잔 값으로
          <br />
          <span className="text-black">나를 더 정확히</span> 아는 법
        </h1>
        <p className="mt-5 text-gray-700 leading-relaxed">
          Goldberg(1992) IPIP Big-Five 50문항. 10분 안에 끝나고, AI가 요인별로 길게
          해석해 주며, 각 요인의 학술 근거 논문을 자동으로 찾아 붙여 드립니다.
          1,500원 — 아메리카노 한 잔 가격입니다.
        </p>

        <div className="mt-8 flex items-end gap-4">
          <div>
            <div className="text-sm text-gray-400 line-through">
              원래 {ANCHOR_PRICE.toLocaleString()}원
            </div>
            <div className="text-3xl font-bold">
              {SALE_PRICE.toLocaleString()}원{' '}
              <span className="text-sm font-normal text-gray-500">
                ({DISCOUNT_PCT}% 할인)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/test/ipip50"
            className="inline-block text-center px-6 py-3 bg-black text-white rounded-md font-medium"
          >
            검사 시작하기
          </Link>
          <a
            href="#why"
            className="inline-block text-center px-6 py-3 border border-gray-300 rounded-md font-medium"
          >
            왜 이 가격이죠?
          </a>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          쿠폰이 있다면 결제 화면에서 입력해 무료로 받을 수도 있어요.
        </div>
      </section>

      <section id="why" className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold">왜 이렇게 싸요?</h2>
          <p className="mt-4 text-gray-700 leading-relaxed">
            시중 유료 검사(MBTI, 에니어그램, 기질 리포트)는 보통 1–3만원쯤 합니다.
            솔직히 그 가격이 부담되어서 검사를 못 받거나, 조악한 무료 버전으로
            대신하고 마는 경우가 많다고 느꼈어요.
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed">
            저는 개발자이고, 이 사이트의 인프라 비용은 무료 티어 한도 안에서 돌고
            있어요 (Vercel, Supabase, Gemini 무료 쿼터). 결제 수수료 + AI 호출
            비용만 회수되면 되기 때문에 1,500원 — 아메리카노 한 잔 값이 가능합니다.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-md bg-white">
              <div className="text-sm text-gray-500">시중 평균</div>
              <div className="mt-1 text-xl font-semibold">12,000원 내외</div>
              <div className="mt-1 text-xs text-gray-400">종이/PDF 리포트</div>
            </div>
            <div className="p-4 border border-black rounded-md bg-white">
              <div className="text-sm text-gray-500">여기</div>
              <div className="mt-1 text-xl font-semibold">1,500원</div>
              <div className="mt-1 text-xs text-gray-400">
                AI 해석 + 논문 인용 포함
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold">얻게 되는 것</h2>
        <ul className="mt-5 space-y-3 text-gray-700">
          <li>• 5요인(개방성·성실성·외향성·우호성·신경성) 점수 및 백분위</li>
          <li>• 요인별 AI 해석 (한국어, 균형 있는 장/단점)</li>
          <li>• 자동 수집한 학술 논문 링크 (OpenAlex)</li>
          <li>• 리포트 링크 7일간 유효 (익명, 로그인 없음)</li>
        </ul>
      </section>

      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold">학술적 배경</h2>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Big Five(5요인 모델)는 성격심리학에서 가장 광범위하게 검증된 프레임워크
            중 하나입니다. Costa &amp; McCrae(1992)의 NEO-PI-R, Goldberg(1992)의
            Big-Five Factor Markers 이후 수천 편의 후속 연구에서 직업 성과, 관계
            만족도, 정신건강 지표와의 연관이 반복적으로 확인되어 왔습니다.
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed">
            이 사이트는 Goldberg(1992)가 <strong>공개 도메인</strong>으로 제공하는
            50문항(IPIP-Big-Five Factor Markers)을 사용합니다. MBTI처럼 유형으로
            나누지 않고, 5개 축에서 각자의 위치를 백분위로 보여 줍니다.
          </p>
          <p className="mt-4 text-xs text-gray-500">
            Goldberg, L. R. (1992). The development of markers for the Big-Five factor
            structure. <em>Psychological Assessment, 4</em>(1), 26–42.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold">자주 묻는 질문</h2>
        <dl className="mt-6 space-y-6">
          <div>
            <dt className="font-semibold">정말 익명인가요?</dt>
            <dd className="mt-1 text-gray-700 text-sm leading-relaxed">
              회원가입이 없어요. 결제 시점에 토스페이먼츠가 카드정보를 처리하지만,
              본 사이트의 DB에는 이메일·이름·전화번호가 저장되지 않습니다.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">리포트는 어디에 저장되나요?</dt>
            <dd className="mt-1 text-gray-700 text-sm leading-relaxed">
              결제 후 받는 7일짜리 고유 링크로만 접근할 수 있어요. 링크를 잃어버리면
              복구가 어려우니 북마크해 주세요.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">AI 해석이 정확한가요?</dt>
            <dd className="mt-1 text-gray-700 text-sm leading-relaxed">
              AI는 점수 패턴을 언어로 풀어 주는 보조 도구이며, 임상 진단은 아닙니다.
              인용되는 논문은 AI가 만들어내지 않고 OpenAlex에서 실제로
              검색한 결과만 붙입니다.
            </dd>
          </div>
        </dl>

        <div className="mt-10">
          <Link
            href="/test/ipip50"
            className="inline-block px-6 py-3 bg-black text-white rounded-md font-medium"
          >
            검사 시작하기 (약 10분)
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-xs text-gray-400">
        Goldberg, L. R. (1992) · 공개 도메인 문항 사용 · 익명 처리
      </footer>
    </main>
  )
}
