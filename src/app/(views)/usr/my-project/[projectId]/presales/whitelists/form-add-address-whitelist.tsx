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
import { formProjectAddressWhitelistSchema } from "@/modules/deploy/deploy.schema"
import { useDeployPresaleSC } from "@/modules/presales/presale.deploy"
import { FormProjectAddressWhitelist, TProject } from "@/types/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"

export default function FormAddAddressWhitelist({ data }: { data: TProject }) {
  const [open, setOpen] = useState(false)
  const { addToWhitelist } = useDeployPresaleSC()
  const form = useForm<FormProjectAddressWhitelist>({
    resolver: zodResolver(formProjectAddressWhitelistSchema),
    defaultValues: {
      projectId: data.id,
      walletAddress: ''
    },
    mode: 'onChange'
  })

  async function onSubmit(values: FormProjectAddressWhitelist) {
    const arrayAddress: string[] = values.walletAddress.split(',')
      .map((addr: string) => addr.trim())
      .filter((addr: string) => addr !== '');
    const newData = arrayAddress.map(addr => {
      return {
        projectId: data.id,
        walletAddress: addr
      }
    })
    addToWhitelist(newData,data.whitelistsAddress!)
  }
  function onOpenChange(state: boolean) {
    setOpen(state)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Add Whitelist</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{'Add Address'}</DialogTitle>
          <DialogDescription>
            Make changes to your whitelist here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              control={form.control}
              name="walletAddress"
              label={`Addresses`}
              placeholder="0x..1,0x..2"
              isLongText
              rows={10}
            />
            <div className="flex justify-end gap-2">
              <Button type='button' onClick={() => setOpen(false)} variant="outline">Cancel</Button>
              <Button type='submit'>
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}