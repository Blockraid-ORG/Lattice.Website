import { FormInput } from '@/components/form-input'
import { FormSelect } from '@/components/form-select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form } from '@/components/ui/form'
import { presalesDurations } from '@/data/constants'
import { useUpdateNewPresale } from '@/modules/presales/presale.query'
import { presalesSchema } from '@/modules/project/project.schema'
import { TFormProjectPresale, TPresale, TProject } from '@/types/project'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
export default function FormEditPresale({ data, item }: { data: TProject, item:TPresale }) {
  const [open, setOpen] = useState(false)
  const unit = data.presales[0].unit
  const { mutate: updateNewPresale} = useUpdateNewPresale()
  const [submitting, setIsSubmiting] = useState(false)

  const form = useForm<TFormProjectPresale>({
    resolver: zodResolver(presalesSchema),
    defaultValues: {
      hardcap: '',
      price: '',
      unit: '',
      maxContribution: '',
      duration: '',
      startDate: '',
      claimTime: '',
      whitelistDuration: '',
      sweepDuration: '',
    },
    mode: "onChange",
  });

  async function onSubmit(values: TFormProjectPresale) {
    setIsSubmiting(true)
    updateNewPresale({
      id: item.id,
      data: {
        ...values,
        price: String(values.price),
        hardcap: String(values.hardcap),
        projectId: data.id
      }
    }, {
      onSuccess: () => {
        toast.success('Success', {
          description :'success create presale'
        })
        setOpen(false)
        setIsSubmiting(false)
      }
    })
  }


  function onOpenChange(state: boolean) {
    setOpen(state)
    if (state) {
      form.reset({
        hardcap: item.hardcap,
        price: item.price,
        unit: unit,
        maxContribution: item.maxContribution,
        duration: String(item.duration),
        startDate: item.startDate
          ? dayjs(item.startDate).format("YYYY-MM-DDTHH:mm")
          : "",
        claimTime: String(item.claimTime),
        whitelistDuration: item.whitelistDuration,
        sweepDuration: item.sweepDuration,
      })
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button size={'icon-sm'} disabled={!!item?.presaleSCID}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
            <DialogHeader>
              <DialogTitle>Form Edit Presale</DialogTitle>
              <DialogDescription>
                Complete form to Edit new presale!
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-3'>
              <div className="flex items-end">
                <div className="flex-1">
                  <FormInput
                    control={form.control}
                    name={`hardcap`}
                    label="Hard Cap"
                    placeholder="e.g. 100000"
                  />
                </div>
                <div className='text-sm mb-2 ml-2'>{unit}</div>
              </div>
              <div className="flex items-end">
                <div className="flex-1">
                  <FormInput
                    control={form.control}
                    name={`price`}
                    label="Price Per Token"
                    placeholder="e.g. 0.01"
                  />
                </div>
                <div className='text-sm mb-2 ml-2'>{unit}</div>
              </div>
              <div className="flex items-end">
                <div className="flex-1">
                  <FormInput
                    control={form.control}
                    name={`maxContribution`}
                    label="Max Contribution"
                    type="number"
                    placeholder="e.g. 500"
                  />
                </div>
                <div className='text-sm mb-2 ml-2'>{unit}</div>
              </div>
              <FormInput
                control={form.control}
                name={`startDate`}
                label="Start Date" type="datetime-local"
              />
              <FormSelect
                control={form.control}
                name={`duration`}
                label="Duration"
                placeholder="select duration"
                groups={presalesDurations ? [{
                  label: 'Duration',
                  options: presalesDurations ?? []
                }] : []}
              />
              <FormSelect
                control={form.control}
                name={`claimTime`}
                label="Claim Available After"
                placeholder="select duration"
                groups={presalesDurations ? [{
                  label: 'Duration',
                  options: presalesDurations ?? []
                }] : []}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button disabled={submitting} variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Update Presale</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
