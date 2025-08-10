
import Community from './comnunity'
import NewHero from './new-hero'
import SupporChain from './suppor-chain'
import Upcoming from './upcoming'

export default function Home() {
  return (
    <>
      <NewHero />
      <section className='bg-[#D8E9FD]/50 py-6 md:py-12 dark:bg-[#0A2342]'>
        <div className="container">
          <h2 className='text-center mb-8 text-2xl md:text-3xl font-bold'>Our Growing Ecosystem</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='bg-white/90 dark:bg-[#F8F9FA] rounded-2xl p-4 md:p-6 border shadow'>
              <p className='text-[#0A2342]'>Active Institutional Users</p>
              <h2 className='text-2xl md:text-4xl font-bold text-[#0A2342] mt-2'>1,200+</h2>
            </div>
            <div className='bg-white/90 dark:bg-[#F8F9FA] rounded-2xl p-4 md:p-6 border shadow'>
              <p className='text-[#0A2342]'>Total Assets Tokenized</p>
              <h2 className='text-2xl md:text-4xl font-bold text-[#0A2342] mt-2'>$150M+</h2>
            </div>
            <div className='bg-white/90 dark:bg-[#F8F9FA] rounded-2xl p-4 md:p-6 border shadow'>
              <p className='text-[#0A2342]'>Countries Represented</p>
              <h2 className='text-2xl md:text-4xl font-bold text-[#0A2342] mt-2'>25+</h2>
            </div>
            <div className='bg-white/90 dark:bg-[#F8F9FA] rounded-2xl p-4 md:p-6 border shadow'>
              <p className='text-[#0A2342]'>Community Members</p>
              <h2 className='text-2xl md:text-4xl font-bold text-[#0A2342] mt-2'>3M+</h2>
            </div>
          </div>
        </div>
      </section>
      <Upcoming />
      <SupporChain />
      <Community />
    </>
  )
}
