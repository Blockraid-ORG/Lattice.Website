'use client'
import whitlelistAbi from '@/abi/whitelist.abi.json'
import { FormInput } from '@/components/form-input'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { formUpdateWhitelistSchema } from '@/modules/deploy/deploy.schema'
import { useProjectDetail } from '@/modules/project/project.query'
import { useUserVerified } from '@/modules/user-verified/user-verified.query'
import { TFormUpdateWhitelist } from '@/types/deploy'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import PresaleHeader from './presale-header'
import { toast } from 'sonner'
import { useUpdatePresaleWhitelist } from '@/modules/presales/presale.query'
import { useAccount, useWalletClient } from 'wagmi'
import { BrowserProvider, ethers } from 'ethers'

export default function FormWhitelist() {
  const [isSubmiting, setIsSubmiting] = useState(false)
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const { projectId } = useParams()
  const { data, isLoading } = useProjectDetail(projectId.toString())
  const { mutate: updatePresaleWhitelist } = useUpdatePresaleWhitelist(projectId.toString())

  const { data: verifiedAddress } = useUserVerified()

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
    const verifiedAddressArray = verifiedAddress?.map(i => i.walletAddress)
    const anyErrorAddr = arrayAddress?.filter((i: string) => !verifiedAddressArray?.includes(i))
    if (anyErrorAddr.length > 0) {
      toast.error('Ups!', {
        description: `${anyErrorAddr} is not verified address`
      })
      return
    }
    const newValues = {
      ...values,
      walletAddress: arrayAddress
    }
    // DEPLOY SC WHITELIST
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    if (data?.presales.whitelistContract) {
      try {
        setIsSubmiting(true)
        const provider = new BrowserProvider(walletClient as any)
        const signer = await provider.getSigner();
        const whitelistFactory = new ethers.Contract(data.presales.whitelistContract, whitlelistAbi.abi, signer)
        await whitelistFactory.addToWhitelist(arrayAddress)
        updatePresaleWhitelist(newValues)
      } catch {
        toast.error('Ups!', {
          description: `Failed to add white,list`
        })
      } finally {
        setIsSubmiting(false)
      }
    }
  }
  useEffect(() => {
    form.setValue('presaleId', data?.presales.id)
    form.setValue('walletAddress', data?.presales.whitelists?.map(i => i.walletAddress).join(','))
  }, [data?.presales.id, data?.presales.whitelists, form])

  return (
    <div>
      {
        data && !isLoading && (
          <>
            <PresaleHeader data={data} />
            <div className="grid lg:grid-cols-2 gap-4 my-6">
              <div className=''>
                <div className='mb-2'>
                  <p className='text-sm font-medium'>Verified Addresses</p>
                </div>
                <div className='p-3 border rounded-lg text-sm'>
                  {
                    verifiedAddress?.map(item => (
                      <div className='break-all' key={item.id}>{item.walletAddress},</div>
                    ))
                  }
                </div>
              </div>
              <div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormInput
                      control={form.control}
                      name="walletAddress"
                      label="Wallet Address In Whitelist"
                      placeholder="0x..1,0x..2"
                      isLongText
                      rows={10}
                    />
                    <div className="flex justify-end">
                      <Button disabled={isSubmiting} type='submit'>
                        {isSubmiting ? 'Updating Whitelist...' :'Save Change'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>

          </>
        )
      }
    </div>
  )
}
