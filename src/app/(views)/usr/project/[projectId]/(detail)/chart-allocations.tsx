'use client'
import { TAllocation } from '@/types/project'
import React from 'react'
import dynamic from "next/dynamic";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ChartAllocations({ data }: { data: TAllocation[] }) {
  if (!data || data.length === 0) return <p>No data</p>
  const series: number[] = data.map(i => Number(i.supply));
  const labels: string[] = data.map(i => i.name) || []
  const options: ApexCharts.ApexOptions = {
    chart: {
      id: 'chart-allocation',
      type: 'pie',
      width: '100%'
    },
    labels,
    stroke: {
      show: true,
      width: 1,
      colors: ['#fff'],
    },
    dataLabels: {
      enabled: true,
    },
    legend: {
      show:false,
      position: 'bottom',
    },
  }
  return (
    <div className='md:w-1/1 mx-auto'>
      <ApexChart type="pie"
        options={options}
        series={series} />
    </div>
  )
}
