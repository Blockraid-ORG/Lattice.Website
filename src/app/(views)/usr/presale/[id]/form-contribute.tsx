import { FormInput } from '@/components/form-input'
import { Icon } from '@/components/icon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Form } from '@/components/ui/form'
import { useDeployPresaleSC } from '@/modules/presales/presale.deploy'
import { formBuyPresale } from '@/modules/project/project.schema'
import { TFormBuyPresale, TPresale, TProject } from '@/types/project'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
export default function FormContribute({ data, presale, onSuccess }: { data: TProject, presale: TPresale, onSuccess?: () => void; }) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { contributePresale } = useDeployPresaleSC()
  const form = useForm<TFormBuyPresale>({
    resolver: zodResolver(formBuyPresale(Number(presale.maxContribution))),
    defaultValues: {
      amount: 0.001
    }
  })
  async function onSubmit(values: TFormBuyPresale) {
    setSubmitting(true)
    contributePresale({ data, presale, amount: values.amount }).then(() => {
      setOpen(false)
      onSuccess?.();
    }).finally(() => {
      setSubmitting(false)
    })
  }
  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild>
        <Button size={'lg'} className='w-full md:w-max'>
          <Icon name="lucide-lab:copy-down" /> Contribute
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Form Contribute</DialogTitle>
          <DialogDescription>
            Maximum Contribution: {presale.maxContribution}
          </DialogDescription>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormInput
                control={form.control}
                label="Amount"
                name={'amount'}
                placeholder="input amount"
              />
              <div className="mt-5 flex justify-end">
                <Button className="flex gap-2" type="submit">
                  {submitting && <Icon name="icon-park-outline:loading" className="animate-spin" />}
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
