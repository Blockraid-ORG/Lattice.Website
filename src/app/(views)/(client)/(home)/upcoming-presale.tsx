'use client'
import { Icon } from '@/components/icon'
import { NumberComma, toUrlAsset } from '@/lib/utils'
import { useUpcomingPresale } from '@/modules/transaction-presale/transaction-presale.query'
import dayjs from 'dayjs'
import Image from 'next/image'
import Link from 'next/link'

export default function UpcomingPresale() {
  const { data, isLoading } = useUpcomingPresale()
  return (
    <section className='py-12 md:py-24 bg-[#D8E9FD]/20 dark:bg-[#001123]'>
      <div className="container">
        <div className='max-w-xl mb-12'>
          <h2 className='text-2xl md:text-4xl font-bold max-w-xl'>Upcoming Project</h2>
          <p>Join a community of project for access early</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
          {
            isLoading ? (
              <div>Loading...</div>
            ) : (
              <>
                {
                  data?.data && data?.data?.map((item, index) => (
                    <div key={index} className='relative border dark:border-transparent bg-white cursor-pointer dark:bg-[#0A2342] p-2 rounded-xl hover:scale-105 duration-300'>
                      <Link href={item.project.id} className="absolute top-4 right-4 z-20 py-1 px-2 bg-blue-500/30 text-blue-600 dark:text-white dark:bg-black rounded-full inline-flex gap-2 items-center text-xs font-bold backdrop-blur">
                        Upcoming
                      </Link>
                      <Link href={item.project.id} className='aspect-square block relative z-10'>
                        {item?.project?.banner && (
                          <Image
                            fill
                            alt='aset'
                            className='z-10 rounded-xl object-cover'
                            src={toUrlAsset(item.project.banner)}
                          />
                        )}
                        <div className="absolute -bottom-7 left-7 h-14 w-14 p-1 bg-white z-10 rounded-full overflow-hidden">
                          <Image width={100} height={100} alt='aset' className='w-full h-full object-cover rounded-full' src={toUrlAsset(item.project.logo) ?? '/images/dummy-1.png'} />
                        </div>
                      </Link>
                      <div className='pl-24 flex justify-end gap-1 mt-2'>
                        {
                          item.project.socials.map((item, index) => (
                            <BadgeSocial key={index} url={item.url} icon={item?.social?.icon} />
                          ))
                        }
                      </div>
                      <Link href={item.project.id} className='px-3 pb-3 pt-6'>
                        <div className='space-y-2'>
                          <div className="flex items-center justify-between">
                            <h2 className='text-xl font-bold'>{item.project.name}</h2>
                            {
                              item.project.chains.map((item, index) => (
                                <Image
                                  key={index}
                                  width={100}
                                  height={100}
                                  alt='aset'
                                  className='w-6 h-6 object-cover rounded-full'
                                  src={`${toUrlAsset(item.chain.logo) ?? '/icons/networks/3.png'}`}
                                />
                              ))
                            }
                          </div>
                          <p className='text-sm line-clamp-2 w-full break-all'>
                            {item.project.detail}
                          </p>
                        </div>
                        <div className='mt-4 space-y-1'>
                          <div className='flex justify-between text-sm font-semibold'>
                            <div>Total Supply:</div>
                            <div>{NumberComma(+item.project.totalSupply)}</div>
                          </div>
                          <div className='flex justify-between text-sm font-semibold'>
                            <div>Start:</div>
                            <div>{dayjs(item.endDate).toNow()}</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                }
              </>
            )
          }
        </div>
      </div>
    </section>
  )
}
const BadgeSocial = (props: { icon: string, url: string }) => {
  return (
    <Link href={props.url} target="_blank" rel="noopener noreferrer" className='bg-blue-200 text-blue-700 rounded-md flex items-center gap-1 p-1 text-xs'>
      <Icon className='text-lg' name={props.icon} />
    </Link>
  )
}