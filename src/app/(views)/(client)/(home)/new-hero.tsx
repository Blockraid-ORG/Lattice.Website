/* eslint-disable @next/next/no-img-element */
import LaunchAppButton from '@/components/launch-app-button'
import Image from 'next/image'
import { ChainHero } from './chain-hero'
export default function NewHero() {
  return (
    <div className='aspect-auto md:aspect-[1440/712] relative'>
      <div className='absolute left-0 top-0 right-0 bottom-0 z-0'>
        <Image className='h-full w-full md:object-cover opacity-20 dark:opacity-100 object-top dark:hidden' alt='star hero' src={'/ills/bg-hero-light.png'} width={1440} height={712} />
        <Image className='h-full w-full md:object-cover opacity-20 dark:opacity-100 object-top hidden dark:block' alt='star hero' src={'/ills/bg-hero.png'} width={1440} height={712} />
      </div>
      <div className='pt-[80px] container relative z-10 pb-6'>
        <div className="grid md:grid-cols-2 items-center">
          <div className='order-1 md:order-0'>
            <div className='space-y-2 md:space-y-8 text-center md:text-start relative'>
              <h1 className='text-3xl md:text-6xl font-bold max-w-xl'>
                Tokenize, Invest, <br />
                Thrive
              </h1>
              <p className='text-sm sm:text-lg md:text-2xl max-w-lg dark:text-blue-200'>
                Empowering the future of real-world asset investing, unlocking global access, fractional ownership, and seamless trading.
              </p>
              <div className="absolute h-12 w-2/3 top-3 right-12">
                <img className='h-full w-full object-contain' alt='star' src={'/ills/vector-1.png'} width={20} height={200} />
              </div>
            </div>
            <div className="mt-6 md:mt-10 flex justify-center md:justify-start">
              <LaunchAppButton />
            </div>
          </div>
          <div className='order-0 md:order-1 relative mb-4 md:mb-12 md:mt-24'>
            <div className="flex justify-center md:justify-end md:pr-8"><ChainHero /></div>
            <div className='max-w-xl md:-mt-6 mx-auto aspect-[521/285] will-change-transform relative z-0'>
              <Image
                className='object-cover h-full w-full rounded-3xl bg-white/20 dark:bg-black/10 backdrop-blur-[2px] border border-white/10 hover:scale-105 duration-300 hover:translate-y-4'
                alt='rocket' src={'/ills/ill-hero-2.png'}
                width={521} height={285} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
