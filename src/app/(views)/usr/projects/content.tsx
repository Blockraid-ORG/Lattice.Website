'use client'
import { useClientProject } from '@/modules/client-project/client-project.query'
import { useRouter, useSearchParams } from 'next/navigation'
import ContentItem from './content-item'

export default function ProjectContent() {
  const router = useRouter()
  const { data, isLoading } = useClientProject()

  const searchParams = useSearchParams()
  async function onPageChange(e: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(e + 1))
    router.push(`?${params.toString()}`)
  }

  return (
    <div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {
          !isLoading && data ? (
            <>
              {data.data.map(i => {
                return (
                  <ContentItem key={i.id} />
                )
              })}
            </>
          ) : <div>Loading</div>
        }
      </div>
      <button onClick={() => onPageChange(1)}>2</button>
    </div>
  )
}
