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
      endDate:'',
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
              <div className="flex items-start">
                <div className="flex-1">
                  <FormInput
                    control={form.control}
                    name={`hardcap`}
                    label="Hard Cap"
                    placeholder="e.g. 100000"
                  />
                  <p className='text-[11px]'>
                    Maximum funds you plan to raise (e.g., 100,000 USDC); sale stops when this limit is reached.
                  </p>
                </div>
                <div className='text-sm mt-10 ml-2'>{unit}</div>
              </div>
              <div className="flex items-start">
                <div className="flex-1">
                  <FormInput
                    control={form.control}
                    name={`price`}
                    label="Price Per Token"
                    placeholder="e.g. 0.01"
                  />
                  <p className="text-[11px]">This sets how much buyers pay per share (e.g., 0.01 USDC/share).</p>
                </div>
                <div className='text-sm mt-10 ml-2'>{unit}</div>
              </div>
              <div className="flex items-start">
                <div className="flex-1">
                  <FormInput
                    control={form.control}
                    name={`maxContribution`}
                    label="Max Contribution"
                    type="number"
                    placeholder="e.g. 500"
                  />
                  <p className="text-[11px]">buy limit per wallet (e.g., 500 USDC)</p>
                </div>
                <div className='text-sm mt-10 ml-2'>{unit}</div>
              </div>
              <div>
                <FormInput
                  control={form.control}
                  name={`startDate`}
                  label="Start Date (sale)" type="datetime-local"
                />
                <p className='text-[11px]'>When your presale begins, it automatically detects your timezone.</p>
              </div>
              <div>
                <FormInput
                  control={form.control}
                  name={`endDate`}
                  label="End Date (sale)" type="datetime-local"
                />
                <p className='text-[11px]'>When your presale ending, it automatically detects your timezone.</p>
              </div>
              {/* <div>
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
                <p className='text-[11px]'>How long the sale runs (e.g., 14 days)</p>
              </div> */}
              <div>
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
                <p className='text-[11px]'>When buyers can claim their shares after sale ends.</p>
              </div>
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
