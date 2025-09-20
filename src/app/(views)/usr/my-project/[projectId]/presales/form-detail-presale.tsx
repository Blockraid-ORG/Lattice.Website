import { Icon } from '@/components/icon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { TPresale, TProject } from '@/types/project'
import { DialogDescription } from '@radix-ui/react-dialog'
import { useState } from 'react'
import RowItem from '../(detail)/row-item'
import dayjs from 'dayjs'
export default function FormDetailPresale({ data, item }: { data: TProject, item:TPresale }) {
  const [open, setOpen] = useState(false)
  const unit = data.presales[0].unit
  function onOpenChange(state: boolean) {
    setOpen(state)
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button size={'icon-sm'}>
          <Icon className='text-sm' name='entypo:info' />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>Detail Presale</DialogTitle>
          <DialogDescription>
            Detail information presale {data.name}
          </DialogDescription>
          <div>
            <RowItem label='Price' value={`${item.price} ${unit}`} />
            <RowItem label='Hardcap' value={`${item.hardcap} ${unit}`} />
            <RowItem label='Start Date' value={`${dayjs(item.startDate).format('YYYY-MM-DD HH:mm')}`} />
            <RowItem label='End Date' value={`${dayjs(item.endDate).format('YYYY-MM-DD HH:mm')}`} />
            <RowItem label='Max. Contr.' value={`${item.maxContribution} ${unit}`} />
            <RowItem label='Status' value={`${item.isActive ? 'Active':'Inactive'}`} />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
