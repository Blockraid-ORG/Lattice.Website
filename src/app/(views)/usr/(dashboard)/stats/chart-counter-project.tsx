'use client'
import { TProjectCounter } from '@/types/project';
import dynamic from "next/dynamic";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ChartCounterProject({ data }: { data: TProjectCounter[] }) {
  if (!data || data.length === 0) return <p>No data</p>
  const series: number[] = data.map(i => Number(i.count));
  const labels: string[] = data.map(i => i.status) || []
  const options: ApexCharts.ApexOptions = {
    chart: {
      id: 'chart-counter-project',
      type: 'pie',
      // width: '100%'
      width:100
    },
    labels,
    stroke: {
      show: true,
      width: 1,
      colors: ['#fff'],
    },
    dataLabels: {
      enabled: true,
      formatter: function () {
        return ""; 
      },
    },
    legend: {
      position: 'bottom',
    },
  }
  return (
    <div className='md:w-full'>
      <ApexChart type="pie"
        options={options}
        series={series} />
    </div>
  )
}