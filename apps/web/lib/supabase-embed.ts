// Supabase PostgREST의 임베드 리소스 shape 차이를 흡수하는 헬퍼.
//
// - 1:N (자식 여러 개 가능) → 배열 반환
// - 1:1 (FK 컬럼이 UNIQUE 또는 PRIMARY KEY) → 단일 객체 반환
//
// 예: sessions ← participant_profiles(session_id PK) 는 1:1로 감지되어
//     `sessions.participant_profiles`가 배열이 아닌 객체로 돌아옴.
// 기존 코드가 항상 배열을 가정해 `[0]`으로 꺼내면 undefined가 되는 문제를
// 이 헬퍼로 일괄 처리.

export function firstEmbed<T>(v: T | T[] | null | undefined): T | undefined {
  if (v == null) return undefined
  return Array.isArray(v) ? v[0] : v
}
