'use client'
import { Icon } from '@/components/icon'
import { NumberComma, toUrlAsset } from '@/lib/utils'
import { usePublicProject } from '@/modules/project/project.query'
import Image from 'next/image'
import Link from 'next/link'

export default function Upcoming() {
  const { data: upcoming, isLoading } = usePublicProject()
  return (
    <section className='py-12 md:py-24 bg-primary-foreground/10'>
      <div className="container">
        <div className='text-center max-w-xl mx-auto mb-12'>
          <h2 className='text-2xl md:text-4xl font-bold max-w-xl'>RWA Token Sale Launchpad</h2>
          <p>Join a community of investors focused on real-world asset tokens.</p>
        </div>
        <div className='flex justify-between mb-3'>
          <h3 className='text-xl md:text-2xl font-bold'>Upcoming RWA Projects</h3>
          <Link className='text-sm font-semibold text-primary' href={`/`}>Show All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
          {
            isLoading ? (
              <div>Loading...</div>
            ) : (
                <>
                {

                  upcoming?.data && upcoming?.data?.map((item, index) => (
                    <div key={index} className='relative bg-blue-500/5 cursor-pointer dark:bg-primary-foreground/50 p-2 rounded-xl hover:scale-105 duration-300'>
                      <Link href={item.id} className="absolute top-4 right-4 z-20 py-1 px-2 bg-blue-500/30 text-blue-600 dark:text-white dark:bg-black rounded-full inline-flex gap-2 items-center text-xs font-bold backdrop-blur">
                        Upcoming
                      </Link>
                      <Link href={item.id} className='aspect-square block relative z-10'>
                        {item?.banner && (
                          <Image
                            fill
                            alt='aset'
                            className='z-10 rounded-xl object-cover'
                            src={toUrlAsset(item.banner)}
                          />
                        )}
                        <div className="absolute -bottom-7 left-7 h-14 w-14 p-1 bg-white z-10 rounded-full overflow-hidden">
                          <Image width={100} height={100} alt='aset' className='w-full h-full object-cover rounded-full' src={toUrlAsset(item.logo) ?? '/images/dummy-1.png'} />
                        </div>
                      </Link>
                      <div className='pl-24 flex justify-end gap-1 mt-2'>
                        {
                          item.socials.map((item, index) => (
                            <BadgeSocial key={index} url={item.url} icon={item?.social?.icon} />
                          ))
                        }
                      </div>
                      <Link href={item.id} className='px-3 pb-3 pt-6'>
                        <div className='space-y-2'>
                          <div className="flex items-center justify-between">
                            <h2 className='text-xl font-bold'>{item.name}</h2>
                            {
                              item.chains.map((item, index) => (
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
                            {item.detail}
                          </p>
                        </div>
                        <div className='mt-4'>
                          <div className='flex justify-between text-sm font-semibold'>
                            <div>Total Supply:</div>
                            <div>{NumberComma(+item.totalSupply)}</div>
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
