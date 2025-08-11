'use client'

import whitlelistAbi from '@/lib/abis/whitelist.abi.json'
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
import { formUpdateWhitelistSchema } from "@/modules/deploy/deploy.schema"
import { useUpdatePresaleWhitelist } from "@/modules/presales/presale.query"
import { TFormUpdateWhitelist } from "@/types/deploy"
import { TProject } from "@/types/project"
import { TUserVerified } from "@/types/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { BrowserProvider, ethers } from "ethers"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useAccount, useWalletClient } from "wagmi"

export default function FormWhitelistAddress({
  formType,
  data,
  // verifiedAddress
}: {
  formType: 'REMOVE' | 'ADD',
  data: TProject
  verifiedAddress?: TUserVerified[] | []
}) {
  const [open, setOpen] = useState(false)
  const { mutate: updatePresaleWhitelist } = useUpdatePresaleWhitelist(data.id)
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const [isSubmiting, setIsSubmiting] = useState(false)
  const form = useForm<TFormUpdateWhitelist>({
    resolver: zodResolver(formUpdateWhitelistSchema),
    defaultValues: {
      presaleId: '',
      walletAddress: ''
    }
  })

  async function onSubmit(values: TFormUpdateWhitelist) {
    const arrayAddress = values.walletAddress.split(',')
      .map((addr: string) => addr.trim())
      .filter((addr: string) => addr !== '');
    // const verifiedAddressArray = verifiedAddress?.map(i => i.walletAddress)
    // const anyErrorAddr = arrayAddress?.filter((i: string) => !verifiedAddressArray?.includes(i))
    // if (anyErrorAddr.length > 0) {
    //   toast.error('Ups!', {
    //     description: `${anyErrorAddr} is not verified address`
    //   })
    //   return
    // }
    const newValues = {
      ...values,
      walletAddress: arrayAddress
    }
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    if (data?.presales.whitelistContract) {
      try {
        setIsSubmiting(true)
        const provider = new BrowserProvider(walletClient as any)
        const signer = await provider.getSigner();
        const whitelistFactory = new ethers.Contract(data.presales.whitelistContract, whitlelistAbi.abi, signer)
        if (formType === 'ADD') {
          const tx = await whitelistFactory.addToWhitelist(arrayAddress)
          await tx.wait()
        }
        if (formType === 'REMOVE') {
          const tx = await whitelistFactory.removeFromWhitelist(arrayAddress)
          await tx.wait()
        }
        updatePresaleWhitelist(newValues)
      } catch (error: any) {
        toast.error('Ups!', {
          description: `Failed to ${formType} whitelist`
        })
        console.log(error)
      } finally {
        setIsSubmiting(false)
        setOpen(false)
      }
    }
  }
  function onOpenChange(state: boolean) {
    form.setValue('presaleId', data?.presales.id)
    form.setValue('walletAddress', data?.presales.whitelists?.map(i => i.walletAddress).join(','))
    setOpen(state)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {
          formType === 'ADD' ?
            <Button size={'sm'}>Add Whitelist</Button> :
            <Button variant={'destructive'} size={'sm'}>Remove Whitelist</Button>
        }
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{formType + ' ADDRESS'}</DialogTitle>
          <DialogDescription>
            Add/remove address can be performed after contract deployed.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              control={form.control}
              name="walletAddress"
              label={`List address to remove to ${formType.toLocaleLowerCase()}`}
              placeholder="0x..1,0x..2"
              isLongText
              rows={10}
            />
            <div className="flex justify-end gap-2">
              <Button type='button' onClick={() => setOpen(false)} variant="outline">Cancel</Button>
              <Button disabled={isSubmiting} type='submit'>
                {isSubmiting ? 'Updating Whitelist...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
