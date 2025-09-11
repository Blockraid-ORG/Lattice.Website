'use client'
import { FormInput } from "@/components/form-input"
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
import { useAirdrop } from "@/modules/deploy/deploy.airdrop"
import { formRemoveAllocationSchema } from "@/modules/deploy/deploy.schema"
import { TFormRemoveAllocation } from "@/types/deploy"
import { TAdditionalReward } from "@/types/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

export default function FormRemoveAddress({ data }: { data: TAdditionalReward }) {
  const { clearAllocations } = useAirdrop()
  const [open, setOpen] = useState(false)
  const [isSubmiting, setIsSubmiting] = useState(false)
  const form = useForm<TFormRemoveAllocation>({
    resolver: zodResolver(formRemoveAllocationSchema),
    defaultValues: {
      address: ''
    }
  })

  async function onSubmit(values: TFormRemoveAllocation) {
    setIsSubmiting(true)
    const addressesList: string[] = values.address.split(/[,\n]\s*/).filter((address:string) => address.trim() !== "");
    const uniqueAddresses = Array.from(new Set(addressesList));
    clearAllocations(uniqueAddresses, data).finally(() => {
      setIsSubmiting(false)
      setOpen(false);
    })
  }
  function onOpenChange(state: boolean) {
    setOpen(state)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size={'sm'} variant={'destructive'}><Trash2 /> Allocations</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{'Address to remove from allocations'}</DialogTitle>
          <DialogDescription>
            Paste addresses below using comma delimiters.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              control={form.control}
              name="address"
              label={`List address to remove`}
              placeholder="0x660dcCEF25cCcb5f3bC4031b635C51A180e402c2,0x660dcCEF25cCcb5f3bC4031b635C51A180e402c3,..."
              isLongText
              rows={10}
            />
            <div className="flex justify-end gap-2">
              <Button type='button' onClick={() => setOpen(false)} variant="outline">Cancel</Button>
              <Button disabled={isSubmiting} type='submit'>
                {isSubmiting ? 'Removing Address...' : 'Remove'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
