import Image from 'next/image'

const data = [
  {
    logo: '/icons/tools/alchemy.png'
  },
  {
    logo: '/icons/tools/uniswap.png'
  },
  {
    logo: '/icons/tools/web3auth.png'
  },
  {
    logo: '/icons/tools/pinata.png'
  },
  {
    logo: '/icons/tools/zkme.png'
  },
  {
    logo: '/icons/tools/aws.png'
  },
]

export default function ToolsIntegrated() {
  return (
    <section className='bg-[#D8E9FD]/50 py-6 md:py-12 dark:bg-[#0A2342]'>
      <div className="container">
        <div className='text-center max-w-xl mx-auto mb-5'>
          <h2 className='text-2xl md:text-4xl font-bold max-w-xl'>Integrated With</h2>
        </div>
        <div className="flex justify-center flex-wrap gap-4">
          {data.map((item, index) => (
            <div key={index} className='dark:bg-white bg-white/60 rounded-sm'>
              <Image width={320} height={120} alt='chain' className='w-28 h-12 object-contain' src={item.logo} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
