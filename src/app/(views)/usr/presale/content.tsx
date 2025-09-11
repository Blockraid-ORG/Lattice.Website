'use client'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem
} from "@/components/ui/pagination"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import ContentItem from './content-item'
import LoadingItem from './loading-item'
import { useCategoryList } from '@/modules/category/category.query'
import { cn } from '@/lib/utils'
// import { usePresaleDeployed } from '@/modules/presales/presale.query'
import { useActivePresale } from '@/modules/transaction-presale/transaction-presale.query'

export default function ActivePresale() {
  const router = useRouter()
  const { data, isLoading } = useActivePresale()
  const { data: categories } = useCategoryList()

  const searchParams = useSearchParams()
  async function onPageChange(e: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(e + 1))
    router.push(`?${params.toString()}`)
  }

  async function onChangeCategory(categoryId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('categoryId', String(categoryId))
    router.push(`?${params.toString()}`)
  }
  const handleReset = () => {
    if (typeof window !== 'undefined') {
      const page = '1'
      const pageSize = '10'

      const newParams = new URLSearchParams()
      newParams.set('page', page)
      newParams.set('pageSize', pageSize)
      window.history.replaceState(null, '', `?${newParams.toString()}`)
    }
  }
  return (
    <div>
      <div className='flex flex-wrap gap-2 mb-8'>
        <Button variant={'outline'} onClick={handleReset} className={cn(
          'rounded-full'
        )}>
          All
        </Button>
        {
          categories?.map(item => (
            <Button
              variant={'outline'}
              onClick={() => onChangeCategory(item.value)}
              className={cn(
                'rounded-full'
              )} key={item.value}>
              {item.label}
            </Button>
          ))
        }
      </div>
      {
        !isLoading ? (
          <>
            {data?.data.length ? (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[70vh] items-start">
                  {data.data.map(i => {
                    return (
                      <ContentItem data={i} key={i.id} />
                    )
                  })}
                </div>
                <div className='sticky bottom-0 z-20 py-3 backdrop-blur-2xl mt-3'>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant={'ghost'}
                          size={'sm'}
                          onClick={() => onPageChange(0)}
                        >
                          <ChevronLeft /> Prev
                        </Button>
                      </PaginationItem>
                      {
                        [...Array(data?.meta.lastPage)].map((_, index) => (
                          <PaginationItem key={index}>
                            <Button
                              variant={index + 1 === data.meta.currentPage ? 'default':'outline'}
                              size={'sm'}
                              className='font-bold'
                              onClick={() => onPageChange(index)}
                            >
                              {index + 1}
                            </Button>
                          </PaginationItem>
                        ))
                      }
                      <PaginationItem>
                        <Button
                          variant={'ghost'}
                          size={'sm'}
                          onClick={() => onPageChange(data?.meta.lastPage - 1)}
                        >
                          Next <ChevronRight />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            ) : (
              <div className='text-center font-medium h-56 flex items-center justify-center'>Data Not Found!</div>
            )}
          </>
        ) : (
          <LoadingItem count={4} />
        )
      }
    </div>
  )
}
