// 전자상거래법상 의무표시사항 + 카카오페이·입점 심사용 사업자 정보.
// 사업자등록증(발급일 2026-04-24, 계양세무서) 기준 원본 값만 보관한다.
// 통신판매업 신고번호(mailOrderSalesRegistrationNumber)는 별도 신고 대상이며,
// 값이 비어 있으면 푸터에서는 해당 줄을 자동으로 숨긴다.

export const BUSINESS_INFO = {
  nameKo: '기록(kirok)',
  nameEn: 'kirok',
  brandName: 'kirok',
  representative: '김준수',
  businessRegistrationNumber: '412-09-65266',
  // 통신판매업 신고번호를 받은 뒤 이 값을 채우면 푸터·약관에 자동 반영됨.
  mailOrderSalesRegistrationNumber: '',
  taxationType: '일반과세자',
  address:
    '인천광역시 계양구 아나지로213번길 22, 102동 1206호(효성동, 풍림아파트)',
  businessType: '도매 및 소매업',
  businessCategory: '전자상거래 소매업',
  openedOn: '2026-04-24',
  phone: '010-4046-4621',
  email: 'junsu4621@naver.com',
  hostingProvider: 'Vercel Inc. (vercel.com)',
  privacyOfficer: '김준수',
} as const

export type BusinessInfo = typeof BUSINESS_INFO
