'use client'
import { FormInput } from "@/components/form-input"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { formBuyPresale } from "@/modules/project/project.schema"
import { TFormBuyPresale, TPresale } from "@/types/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export function FormBuyPresale({ data }: { data: TPresale }) {
  const form = useForm<TFormBuyPresale>({
    resolver: zodResolver(formBuyPresale(Number(data.maxContribution))),
    defaultValues: {
      amount: 0
    }
  })
  async function onSubmit(values: TFormBuyPresale) {
    toast.info('Under Development!', {
      description: `you will contibute ${values.amount}`
    })
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={'lg'} className='w-full md:w-max'>
          <Icon name="lucide-lab:copy-down" /> Contribute
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Form Contribute</DialogTitle>
          <DialogDescription>
            Maximum Contribution: {data.maxContribution}
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
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

