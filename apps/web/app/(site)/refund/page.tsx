import type { Metadata } from 'next'
import { BUSINESS_INFO } from '@/lib/business-info'

export const metadata: Metadata = {
  title: '환불정책 · kirok',
  description: '기록(kirok) 성격검사 리포트 환불정책',
  alternates: { canonical: '/refund' },
}

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. 디지털 콘텐츠 특성 고지',
    body: `본 서비스가 제공하는 리포트는 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조제2항 제5호에서 정한 디지털 콘텐츠(가분적·복제가능)에 해당합니다. 리포트 접근 링크가 발급되어 열람이 시작된 이후에는 원칙적으로 청약철회가 제한됩니다.`,
  },
  {
    title: '2. 전액 환불이 가능한 경우',
    body: `다음의 경우 전액 환불합니다.
- 결제는 완료되었으나 리포트 접근 링크가 발급되지 않은 경우
- 리포트가 생성되었으나 기술적 장애로 열람이 불가능한 경우(회사의 복구가 지연되는 경우 포함)
- 결제 화면에 표시된 금액과 실제 청구액이 다른 경우
- 청약 후 회사가 공급 가능하다고 확인한 시점으로부터 7일 이내에 리포트가 발급되지 않은 경우`,
  },
  {
    title: '3. 환불이 제한되는 경우',
    body: `다음의 경우 이용자의 단순 변심에 의한 환불은 제한됩니다.
- 리포트 접근 링크로 1회 이상 리포트를 열람한 경우
- 리포트 유효기간(결제 후 7일)이 경과한 경우

다만, 회사가 이용자에게 별도의 고지 없이 서비스 내용을 변경하였거나 광고와 다른 내용으로 제공한 경우에는 본 조항에도 불구하고 환불이 가능합니다.`,
  },
  {
    title: '4. 환불 절차 및 기간',
    body: `- 신청 방법: ${BUSINESS_INFO.email} 로 주문번호(또는 리포트 접근 링크) 및 환불 사유를 기재하여 신청해 주세요.
- 접수 확인 후 영업일 기준 3일 이내에 환불 여부를 안내합니다.
- 승인된 환불은 결제수단(카카오페이)에 따라 최대 영업일 기준 5일 이내에 처리됩니다. 카드 취소의 경우 카드사 사정에 따라 수 영업일이 추가로 소요될 수 있습니다.`,
  },
  {
    title: '5. 쿠폰 사용 시',
    body: `무료(100% 할인) 쿠폰으로 발급된 리포트는 금전 거래가 발생하지 않으므로 환불 대상이 아니며, 리포트 발급 자체의 하자가 있는 경우에는 재발급으로 대응합니다.`,
  },
  {
    title: '6. 분쟁 해결',
    body: `환불 관련 분쟁은 「전자상거래 등에서의 소비자보호에 관한 법률」, 「소비자기본법」 등 관계법령 및 공정거래위원회 고시 「전자상거래 등에서의 소비자보호 지침」을 따르며, 당사자 간 원만히 해결되지 않는 경우 소비자분쟁조정위원회의 조정을 신청할 수 있습니다.`,
  },
]

export default function RefundPage() {
  return (
    <main>
      <article className="max-w-2xl mx-auto px-6 py-12 sm:py-16">
        <header>
          <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            Refund Policy
          </p>
          <h1 className="mt-4 text-3xl font-semibold">환불정책</h1>
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
