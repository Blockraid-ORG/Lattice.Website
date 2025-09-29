'use client'
import { TProject } from '@/types/project';
import PresaleInfoItem from './presale-info-item';

export default function PresaleInfo({ data }: { data: TProject }) {
  
  return (
    <div className='z-20 px-3 md:px-0'>
      <div className="relative container">
        <div className='mt-4'>
          {
            data.presales.map(presale => (
              <PresaleInfoItem key={presale.id} presale={presale} data={data} />
            ))
          }
        </div>
      </div>
    </div>
  )
}
