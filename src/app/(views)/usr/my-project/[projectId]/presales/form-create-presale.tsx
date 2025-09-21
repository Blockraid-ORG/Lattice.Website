import { Button } from '@/components/ui/button'
import { TFormProjectPresale, TProject } from '@/types/project'
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
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { presalesSchema } from '@/modules/project/project.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormInput } from '@/components/form-input'
import { Form } from '@/components/ui/form'
import { FormSelect } from '@/components/form-select'
import { presalesDurations } from '@/data/constants'
import { useCreateNewPresale } from '@/modules/presales/presale.query'
import { toast } from 'sonner'
export default function FormCreatePresale({ data }: { data: TProject }) {
  const [open, setOpen] = useState(false)
  const unit = data.presales[0].unit
  const { mutate: createNewPresale } = useCreateNewPresale()
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
    createNewPresale({
      ...values,
      price: String(values.price),
      hardcap: String(values.hardcap),
      projectId: data.id
    }, {
      onSuccess: () => {
        toast.success('Success', {
          description: 'success create presale'
        })
        setOpen(false)
        setIsSubmiting(false)
      }
    })
  }


  function onOpenChange(state: boolean) {
    setOpen(state)
    if (state) {
      form.setValue('unit', unit)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button>Create Presale</Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
            <DialogHeader>
              <DialogTitle>Form Create Presale</DialogTitle>
              <DialogDescription>
                Complete form to create new presale!
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
              <Button type="submit">Save Presale</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
