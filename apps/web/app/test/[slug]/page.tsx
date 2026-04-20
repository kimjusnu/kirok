import { notFound } from 'next/navigation'
import { getTestById } from '@temperament/tests'
import { TestRunner } from './TestRunner'

export const dynamic = 'force-dynamic'

export default function TestPage({ params }: { params: { slug: string } }) {
  const test = getTestById(params.slug)
  if (!test) notFound()

  return (
    <main>
      <TestRunner
        slug={params.slug}
        nameKo={test.nameKo}
        estimatedMinutes={test.estimatedMinutes}
        items={test.items.map((i) => ({ order: i.order, textKo: i.textKo }))}
        translationNote={test.translation.note}
      />
    </main>
  )
}
