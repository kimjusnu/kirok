import { notFound, redirect } from 'next/navigation'
import { getTestById } from '@temperament/tests'
import { TestRunner } from './TestRunner'

export const dynamic = 'force-dynamic'

type SearchParams = { sid?: string; at?: string }

export default function TestRunPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: SearchParams
}) {
  const test = getTestById(params.slug)
  if (!test) notFound()

  if (!searchParams.sid || !searchParams.at) {
    // Missing session — bounce back to the consent form.
    redirect(`/test/${params.slug}`)
  }

  return (
    <main>
      <TestRunner
        slug={params.slug}
        sessionId={searchParams.sid!}
        accessToken={searchParams.at!}
        nameKo={test.nameKo}
        estimatedMinutes={test.estimatedMinutes}
        items={test.items.map((i) => ({ order: i.order, textKo: i.textKo }))}
        translationNote={test.translation.note}
      />
    </main>
  )
}
