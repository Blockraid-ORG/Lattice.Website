import { FormInput } from "@/components/form-input"
import { FormSelect } from "@/components/form-select"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { useCreateAdditionalReward } from "@/modules/additional-rewards/additional-reward.query"
import { formAdditionalRewardSchema } from "@/modules/additional-rewards/additional-reward.schema"
import { TFormAdditionalReward } from "@/types/additional-reward"
import { zodResolver } from "@hookform/resolvers/zod"
import dayjs from "dayjs"
import { useState } from "react"
import { useForm } from "react-hook-form"

export function FormCreateAirdrop({ projectId }: { projectId: string }) {
  const {mutate: createAdditionalReward } = useCreateAdditionalReward()
  const [open, setOpen] = useState(false)
  const form = useForm<TFormAdditionalReward>({
    resolver: zodResolver(formAdditionalRewardSchema),
    defaultValues: {
      amount: '0',
      startDateClaim: '',
      projectId: '',
      unitTime: 'day'
    },
    mode: "onChange",
  });

  async function handleSubmit(values: TFormAdditionalReward) {
    const newValues = {
      ...values,
      projectId,
      startDateClaim: dayjs(values.startDateClaim).format(),
      endDateClaim: dayjs(values.startDateClaim).add(values.duration, values.unitTime).format(),
    }
    createAdditionalReward(newValues, {
      onSuccess() {
        form.reset()
        setOpen(false)
      }
    })
  }
  function onOpenChange(state: boolean) {
    setOpen(state)
    if (state) {
      form.setValue('projectId', projectId)
    }
  }
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetTrigger asChild>
        <Button>Create Airdrop</Button>
      </SheetTrigger>
      <SheetContent side={'bottom'} className="max-h-[90vh]">
        <SheetHeader className="container">
          <SheetTitle>Create Airdrop</SheetTitle>
          <SheetDescription>
            Create New Airdrop
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[70vh] overflow-auto container">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-4 gap-3">
                <FormInput
                  control={form.control}
                  name={`amount`}
                  label="Amount"
                  placeholder="0"
                  type="number"
                />
                <FormInput
                  control={form.control}
                  name={`startDateClaim`}
                  label="Start Date"
                  placeholder="0"
                  type="datetime-local"
                />
                <FormInput
                  control={form.control}
                  name={`duration`}
                  label="Duration"
                  placeholder="0"
                  type="number"
                />
                <FormSelect
                  control={form.control}
                  name="unitTime"
                  label="Select Unit"
                  placeholder="select unit"
                  groups={[{
                    label: 'Unit Time',
                    options: [
                      {
                        label: 'Day',
                        value: 'day'
                      },
                      {
                        label: 'Month',
                        value: 'month'
                      }
                    ],
                  }]}
                />
              </div>
              <Separator />
              <div className="flex gap-2 justify-end sticky bottom-0 py-4 backdrop-blur-lg">
                <Button type="submit">
                  {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
