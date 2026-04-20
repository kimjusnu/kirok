import type { Metadata } from 'next'
import { BUSINESS_INFO } from '@/lib/business-info'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description:
    'kirok(기록) Big Five 성격검사 서비스의 개인정보처리방침 전문. 수집 항목·목적·보유기간·위탁처리업체를 명시합니다. 실명·연락처는 수집하지 않습니다.',
  alternates: { canonical: '/privacy' },
  openGraph: { title: '개인정보처리방침 · kirok', type: 'article' },
}

const ARTICLE_LD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'kirok 개인정보처리방침',
  inLanguage: 'ko-KR',
  datePublished: '2026-04-20',
  dateModified: '2026-04-20',
  author: {
    '@type': 'Organization',
    name: '기록(kirok)',
    url: SITE_URL,
  },
  publisher: { '@id': `${SITE_URL}/#organization` },
  mainEntityOfPage: `${SITE_URL}/privacy`,
  articleSection: '법정',
}

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. 총칙',
    body: `${BUSINESS_INFO.nameKo}(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 및 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관계법령을 준수합니다. 본 방침은 회사가 제공하는 성격검사 리포트 서비스(이하 "서비스")의 개인정보 처리에 관한 사항을 알려드립니다.`,
  },
  {
    title: '2. 수집하는 개인정보 항목 및 수집 방법',
    body: `회사는 회원가입 없이 익명으로 서비스를 제공하며, 다음 최소 정보만 수집합니다.

[필수 수집]
- 닉네임(리포트 표시용), 성별, 연령대 (선택 시 "미응답" 가능)
- 검사 응답(리커트 5점) 및 산출 점수·백분위
- 서비스 이용 로그(접속 IP, 쿠키, 접속 일시)

[결제 시]
- 결제 수단 정보(카드번호 등)는 카카오페이(㈜카카오페이)가 처리하며 회사에 저장되지 않습니다. 회사는 결제 식별자(주문번호, 결제승인번호), 결제 금액, 상태만 보관합니다.

[수집 방법]
이용자가 서비스 화면에서 직접 입력하거나, 서비스 이용 과정에서 자동 수집됩니다.`,
  },
  {
    title: '3. 개인정보의 이용 목적',
    body: `- 검사 결과 생성 및 리포트 제공
- 결제 처리 및 환불 대응
- 서비스 이용 통계 분석 및 품질 개선
- 고객 문의 대응 및 분쟁 해결
- 관계법령에 따른 의무 이행(전자상거래법상 거래기록 보존 등)`,
  },
  {
    title: '4. 개인정보의 보유·이용 기간',
    body: `- 리포트 접근 링크: 결제 완료(또는 쿠폰 발급) 시점부터 7일
- 검사 응답·점수·닉네임 등: 리포트 유효기간 종료 후 30일 이내 파기 (통계 분석 목적으로 개인을 식별할 수 없는 형태로 익명화한 데이터는 계속 보관할 수 있음)
- 결제·거래 기록: 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 5년
- 계약 또는 청약철회 등에 관한 기록: 5년
- 소비자의 불만 또는 분쟁처리에 관한 기록: 3년
- 접속 로그: 「통신비밀보호법」에 따라 3개월`,
  },
  {
    title: '5. 개인정보의 제3자 제공',
    body: `회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만 다음의 경우는 예외로 합니다.
- 이용자가 사전에 동의한 경우
- 법령에 근거하거나 수사기관의 적법한 요청이 있는 경우`,
  },
  {
    title: '6. 개인정보 처리의 위탁',
    body: `회사는 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁합니다.

- ㈜카카오페이: 결제 처리
- Supabase Inc.: 데이터베이스 호스팅 (리전: ap-northeast-2)
- Vercel Inc.: 웹 애플리케이션 호스팅
- Google LLC (Gemini API): AI 해석 텍스트 생성 (응답 점수만 전달, 개인 식별 정보는 전달하지 않음)
- OpenAlex: 학술 논문 서지정보 조회 (요청에 개인정보 포함하지 않음)`,
  },
  {
    title: '7. 이용자 및 법정대리인의 권리와 행사 방법',
    body: `이용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요청할 수 있습니다. 서비스 특성상 회원 식별자가 없으므로, 리포트 접근 링크 또는 세션 식별정보를 함께 제시해 주시기 바랍니다. 요청은 ${BUSINESS_INFO.email}로 보내주시면 지체 없이 처리합니다.`,
  },
  {
    title: '8. 쿠키 등 자동수집 장치의 설치·운영 및 거부',
    body: `회사는 서비스 운영에 꼭 필요한 세션 쿠키만 사용합니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 일부 기능 이용이 제한될 수 있습니다.`,
  },
  {
    title: '9. 개인정보의 안전성 확보 조치',
    body: `- 접근권한 최소화 및 서비스 역할 기반 접근 통제
- 전송 구간 암호화(HTTPS)
- 접근기록 보관 및 점검
- 결제정보의 외부 위탁 처리로 내부 저장 최소화`,
  },
  {
    title: '10. 개인정보 보호책임자',
    body: `이용자는 개인정보 관련 문의·불만·피해구제를 아래로 신청할 수 있습니다.

- 개인정보 보호책임자: ${BUSINESS_INFO.privacyOfficer}
- 이메일: ${BUSINESS_INFO.email}
- 전화: ${BUSINESS_INFO.phone}

또한 아래 기관에 개인정보침해신고·상담이 가능합니다.
- 개인정보분쟁조정위원회 (1833-6972, www.kopico.go.kr)
- 개인정보침해신고센터 (118, privacy.kisa.or.kr)
- 대검찰청 사이버수사과 (1301, www.spo.go.kr)
- 경찰청 사이버수사국 (182, ecrm.police.go.kr)`,
  },
  {
    title: '11. 방침의 변경',
    body: `본 방침은 법령·정책 변경 또는 서비스 개편에 따라 수정될 수 있으며, 변경 시 시행일 7일 전부터 서비스 화면에 공지합니다.`,
  },
]

export default function PrivacyPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_LD) }}
      />
      <article className="max-w-2xl mx-auto px-6 py-12 sm:py-16">
        <header>
          <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            Privacy Policy
          </p>
          <h1 className="mt-4 text-3xl font-semibold">개인정보처리방침</h1>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            발행일 <time dateTime="2026-04-20">2026-04-20</time> · 최종 수정{' '}
            <time dateTime="2026-04-20">2026-04-20</time> · 개인정보
            보호책임자 {BUSINESS_INFO.privacyOfficer}
          </p>
        </header>

        <div className="mt-10 space-y-8 prose-editorial text-[15px] leading-[1.8]">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-base font-semibold">{s.title}</h2>
              <p className="mt-2 whitespace-pre-line text-[var(--ink)]">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}
