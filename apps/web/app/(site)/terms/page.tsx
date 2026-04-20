import type { Metadata } from 'next'
import { BUSINESS_INFO } from '@/lib/business-info'

export const metadata: Metadata = {
  title: '이용약관 · kirok',
  description: '기록(kirok) 성격검사 서비스 이용약관',
  alternates: { canonical: '/terms' },
}

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '제1조 (목적)',
    body: `이 약관은 ${BUSINESS_INFO.nameKo}(이하 "회사")가 제공하는 Big Five 기반 성격검사 및 AI 해석 리포트 서비스(이하 "서비스")의 이용에 관한 조건과 절차, 이용자와 회사의 권리·의무·책임사항을 규정하는 것을 목적으로 합니다.`,
  },
  {
    title: '제2조 (정의)',
    body: `1. "서비스"란 공개 도메인 문항(IPIP-50)을 이용해 구성된 성격검사 및 그에 따른 AI 해석·학술 논문 인용 리포트를 온라인으로 제공하는 서비스를 말합니다.
2. "이용자"란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.
3. "리포트"란 이용자의 검사 응답을 기반으로 생성되는 결과물로, 고유 접근 링크(access token)로만 열람할 수 있습니다.`,
  },
  {
    title: '제3조 (약관의 효력 및 변경)',
    body: `1. 본 약관은 서비스 화면에 게시하는 방법으로 공지하며, 이용자가 이에 동의함으로써 효력이 발생합니다.
2. 회사는 관계법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있으며, 변경 시 적용일자 및 사유를 명시하여 적용일 최소 7일 전(이용자에게 불리한 변경은 30일 전)에 공지합니다.`,
  },
  {
    title: '제4조 (서비스의 제공 및 이용)',
    body: `1. 서비스는 회원가입 없이 익명으로 제공됩니다. 이용자는 닉네임·성별·연령대 등 최소 정보만 입력하며, 선택 항목은 "미응답"으로 제출할 수 있습니다.
2. 유료 결제 완료 후 발급되는 고유 접근 링크로 리포트를 열람할 수 있으며, 해당 링크의 유효기간은 결제 완료 시점으로부터 7일입니다.
3. 회사는 서비스의 안정적 제공을 위해 노력하나, 설비 점검·장애·관계법령 준수 등의 사유로 일시 중단될 수 있습니다.`,
  },
  {
    title: '제5조 (이용요금 및 결제)',
    body: `1. 서비스 이용 요금은 결제 페이지에 표시된 금액으로 하며, 쿠폰이 적용된 경우 할인된 금액이 청구됩니다.
2. 결제 수단은 카카오페이(간편결제)를 이용하며, 결제 정보(카드번호 등)는 결제대행사(카카오페이)가 처리하고 회사는 별도로 저장하지 않습니다.
3. 100% 할인 쿠폰(무료) 사용 시에는 결제 절차 없이 즉시 리포트가 발급됩니다.`,
  },
  {
    title: '제6조 (청약철회 및 환불)',
    body: `본 서비스는 디지털 콘텐츠의 성격상 환불에 제한이 있습니다. 자세한 사항은 "환불정책(/refund)"을 따릅니다.`,
  },
  {
    title: '제7조 (이용자의 의무)',
    body: `1. 이용자는 자신의 접근 링크를 제3자에게 제공하거나 도용당하지 않도록 관리할 책임이 있습니다.
2. 이용자는 서비스의 결과물을 임상 진단·채용·차별적 목적으로 사용해서는 안 되며, 순수 자기이해 목적으로만 활용해야 합니다.
3. 이용자는 서비스를 불법·부정한 방법으로 이용하거나 시스템 무결성을 훼손하는 행위를 해서는 안 됩니다.`,
  },
  {
    title: '제8조 (지적재산권)',
    body: `1. IPIP-50 문항은 Goldberg(1992)의 공개 도메인 자료입니다.
2. 리포트 본문(AI 해석 포함)의 저작권은 회사에 있으나, 이용자는 본인의 자기이해 및 비상업적 목적 내에서 이를 자유롭게 활용할 수 있습니다.
3. 리포트 내 인용되는 학술 논문의 저작권은 각 저작권자에게 있으며, 회사는 OpenAlex 등 공개 학술 데이터베이스에서 확인된 서지정보를 기재할 뿐, 논문 본문을 복제·배포하지 않습니다.`,
  },
  {
    title: '제9조 (면책)',
    body: `1. 리포트의 해석은 자기이해를 돕기 위한 참고 자료이며, 임상 진단·의료적 판단·인사 평가 등 어떠한 공식적 판정도 아닙니다.
2. 회사는 천재지변·불가항력·제3자(결제대행사·호스팅사·AI 제공자) 장애로 인한 서비스 지연·중단에 대해 귀책사유 없는 범위에서 책임지지 않습니다.`,
  },
  {
    title: '제10조 (준거법 및 분쟁해결)',
    body: `본 약관은 대한민국 법률에 따라 해석되며, 본 서비스와 관련하여 분쟁이 발생한 경우 민사소송법상의 관할 법원을 제1심 관할법원으로 합니다.`,
  },
]

export default function TermsPage() {
  return (
    <main>
      <article className="max-w-2xl mx-auto px-6 py-12 sm:py-16">
        <header>
          <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            Terms of Service
          </p>
          <h1 className="mt-4 text-3xl font-semibold">이용약관</h1>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            시행일 2026-04-20
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

        <footer className="mt-14 pt-8 border-t border-[var(--line)] text-[11px] text-[var(--ink-soft)] leading-relaxed">
          <p>
            사업자: {BUSINESS_INFO.nameKo} · 대표 {BUSINESS_INFO.representative}{' '}
            · 사업자등록번호 {BUSINESS_INFO.businessRegistrationNumber}
          </p>
          <p>주소: {BUSINESS_INFO.address}</p>
          <p>문의: {BUSINESS_INFO.email}</p>
        </footer>
      </article>
    </main>
  )
}
