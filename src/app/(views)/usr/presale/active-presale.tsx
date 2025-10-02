import { TProject } from '@/types/project'
import React from 'react'
import PresaleItem from './presale-item'

export default function ActivePresale({ data }: { data: TProject[] }) {
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map(item => (
          <PresaleItem key={item.id} data={item} />
        ))}
      </div>
    </div>
  )
}
