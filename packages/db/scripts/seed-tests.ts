/**
 * Seed the public test catalog into Supabase.
 *
 * Usage:
 *   pnpm --filter @temperament/db seed:tests
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env.
 * Idempotent: upserts tests by slug, test_items by (test_id, order_num).
 */

import { listActiveTests, type TestDefinition } from '@temperament/tests'
import { createServiceClient } from '../src/client'

async function seedOne(
  db: ReturnType<typeof createServiceClient>,
  test: TestDefinition,
): Promise<void> {
  console.log(`\n→ ${test.nameKo} (${test.id})`)

  const { data: testRow, error: testError } = await db
    .from('tests')
    .upsert(
      {
        slug: test.id,
        name_ko: test.nameKo,
        name_en: test.nameEn,
        description: test.description,
        total_items: test.items.length,
        estimated_minutes: test.estimatedMinutes,
        price_krw: 1500,
        anchor_price_krw: 9900,
        is_active: true,
      },
      { onConflict: 'slug' },
    )
    .select('id, slug')
    .single()

  if (testError || !testRow) {
    throw new Error(`tests upsert failed: ${testError?.message ?? 'no row'}`)
  }
  console.log(`  ✓ tests row: ${testRow.id}`)

  const itemRows = test.items.map((item) => ({
    test_id: testRow.id,
    order_num: item.order,
    item_text_ko: item.textKo,
    item_text_en: item.textEn,
    facet: item.facet,
    reverse_scored: item.reverseScored,
    scale_type: item.scaleType,
  }))

  const { error: itemsError, count } = await db
    .from('test_items')
    .upsert(itemRows, { onConflict: 'test_id,order_num', count: 'exact' })

  if (itemsError) {
    throw new Error(`test_items upsert failed: ${itemsError.message}`)
  }
  console.log(`  ✓ test_items upserted: ${count ?? itemRows.length}`)
}

async function main(): Promise<void> {
  const tests = listActiveTests()
  if (tests.length === 0) {
    console.log('No tests registered in @temperament/tests.')
    return
  }

  const db = createServiceClient()
  for (const test of tests) {
    await seedOne(db, test)
  }
  console.log('\nSeed complete.')
}

main().catch((error) => {
  console.error('\nSeed failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
