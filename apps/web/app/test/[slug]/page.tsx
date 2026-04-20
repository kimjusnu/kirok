import { notFound } from 'next/navigation'
import { getTestById } from '@temperament/tests'
import { ConsentForm } from './ConsentForm'

export const dynamic = 'force-dynamic'

export default function TestIntroPage({ params }: { params: { slug: string } }) {
  const test = getTestById(params.slug)
  if (!test) notFound()

  return (
    <main>
      <ConsentForm
        slug={params.slug}
        nameKo={test.nameKo}
        estimatedMinutes={test.estimatedMinutes}
        itemCount={test.items.length}
      />
    </main>
  )
}
