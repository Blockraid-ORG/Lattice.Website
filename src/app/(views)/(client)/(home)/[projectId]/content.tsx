'use client'
import { useProjectDetail } from '@/modules/project/project.query'
import { useParams } from 'next/navigation'
import DetailHeader from './header'
import PresaleInfo from './presale-info'
import TokenInfo from './token-info'
// import { FormBuyPresale } from './form-buy-presale'
import ContentLoader from './content-loader'
import TokenSats from '@/app/(views)/usr/my-project/[projectId]/(detail)/token-stats/token-information/content'

export default function DetailProjectContent() {
  const { projectId } = useParams()
  const { data, isLoading } = useProjectDetail(projectId as string)
  return (
    <div>
      {
        isLoading ? <ContentLoader /> : (
          <>
            {data && <DetailHeader data={data} />}
            {data && <TokenInfo data={data} />}
            {
              data && (
                <div className="container bg-white shadow shadow-neutral-100/5 border p-6 dark:bg-neutral-950 rounded-xl">
                  <TokenSats data={data} />
                </div>
              )
            }
            {data && <PresaleInfo data={data} />}
          </>
        )
      }
      {/* {
        data && (
          <div className='mt-3 flex justify-end container sticky bottom-0 z-30 pb-6 px-4 md:px-0'>
            <FormBuyPresale data={data} />
          </div>
        )
      } */}
    </div>
  )
}
