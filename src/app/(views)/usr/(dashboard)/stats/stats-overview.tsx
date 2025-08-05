'use client'
import { useCounterProject } from '@/modules/project-stats/project-stats.query'
import ChartCounterProject from './chart-counter-project'
import LineChartProject from './line-chart-project'
import { GlowingEffect } from '@/components/ui/glowing-effect'

export default function StatsOverview() {
  const { data, isLoading } = useCounterProject()
  return (
    <div className='mt-6'>
      <h2>Stats Overview</h2>
      <div className='grid md:grid-cols-2 mt-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4'>
        <div className='bg-chart-gradient relative md:col-span-4 xl:col-span-2 aspect-square md:aspect-video xl:aspect-auto flex items-center justify-center dark:border p-3 rounded-2xl'>
          <GlowingEffect
            borderWidth={1}
            variant='default'
            spread={50}
            glow={true}
            disabled={false}
            proximity={70}
            inactiveZone={0.05}
          />
          {!isLoading && data && (
            <ChartCounterProject data={data} />
          )}
        </div>
        <div className='bg-chart-gradient relative md:col-span-4 xl:col-span-3 aspect-square md:aspect-video flex items-center justify-center dark:border p-3 rounded-2xl'>
          <GlowingEffect
            borderWidth={1}
            variant='default'
            spread={50}
            glow={true}
            disabled={false}
            proximity={70}
            inactiveZone={0.05}
          />
          <LineChartProject />
        </div>
      </div>
    </div>
  )
}
