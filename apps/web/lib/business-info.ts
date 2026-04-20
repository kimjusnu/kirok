// 전자상거래법상 의무표시사항 + 카카오페이 심사용 사업자 정보.
// PDF 사업자등록증명(발급번호 9029-464-6335-331, 2026-04-20) 기준.
// 전화번호와 통신판매업 신고번호는 사용자 결정에 따라 공개하지 않음.

export const BUSINESS_INFO = {
  nameKo: '기록(kirok)',
  nameEn: 'kirok',
  brandName: 'kirok',
  representative: '김준수',
  businessRegistrationNumber: '507-06-66733',
  taxationType: '간이과세자',
  address: '인천광역시 계양구 아나지로213번길 22, 102동 1206호(효성동, 풍림아파트)',
  businessType: '도매 및 소매업',
  businessCategory: '전자상거래 소매업',
  openedOn: '2026-04-20',
  email: 'junsu4621@naver.com',
  hostingProvider: 'Vercel Inc. (vercel.com)',
  privacyOfficer: '김준수',
} as const

export type BusinessInfo = typeof BUSINESS_INFO
