'use client'
import DataTable from '@/components/datatable'
import { useAdditionalReward } from '@/modules/additional-rewards/additional-reward.query'
import { TAdditionalReward } from '@/types/project'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormCreateAirdrop } from '../form-create-airdrop'
import { columns } from './columns'

export default function Table({ projectId }: { projectId: string }) {
  const { data: lists, isLoading } = useAdditionalReward(projectId)

  const router = useRouter()
  const searchParams = useSearchParams()
  async function onPageChange(e: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(e + 1))
    router.push(`?${params.toString()}`)
  }
  return (
    <div className='bg-white border dark:bg-primary-foreground/50 p-4 rounded-lg'>
      <DataTable<TAdditionalReward>
        actions={
          <>
            {
              lists?.data && <FormCreateAirdrop projectId={projectId} />
            }
          </>
        }
        data={lists?.data || []}
        columns={columns}
        pageCount={lists?.meta?.lastPage}
        pageIndex={lists?.meta.currentPage ? lists?.meta.currentPage - 1 : 0}
        pageSize={lists?.meta.lastPage}
        onPageChange={onPageChange}
        isLoading={isLoading}
      />
    </div>
  )
}
