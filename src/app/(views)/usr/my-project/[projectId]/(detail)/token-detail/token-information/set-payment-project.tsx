'use client'
import { Icon } from '@/components/icon'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import { usePaymentSC } from '@/modules/payment/payment.hook'
import { TPagination } from '@/types/pagination'
import { TMasterPayment } from '@/types/payment'
import { TProject } from '@/types/project'
import { useState } from 'react'
export default function SetPaymentProject({ data, addressPool }: { data: TProject, addressPool?:TPagination<TMasterPayment> }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const { pay } = usePaymentSC()
  async function handleSubmit() {
    setIsSubmitting(true)
    pay(data, addressPool).finally(() => {
      setOpen(false)
      setIsSubmitting(false)
    })
  }

  return (
    <AlertDialog onOpenChange={() => setOpen(!open)} open={open}>
      <AlertDialogTrigger asChild>
        <div className='flex items-center justify-between gap-2 flex-1'>
          {
            data.addressPoolPaymentLog.length > 0 ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div> Paid
                </div>
              </>
            ) : (
              <>

                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div> Unpaid
                </div>
                <Button>
                  <Icon name="solar:wallet-bold" />
                  Pay Now!
                </Button>
              </>
            )
          }
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Confirmation Payment</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <div className="text-center">
                <div>
                  {
                    isSubmitting ? (
                      <Icon className="text-4xl mx-auto animate-spin" name="icon-park-outline:loading" />
                    ) : (
                      <Icon className="text-4xl mx-auto" name="token:usdc" />
                    )
                  }
                </div>
                <p className='font-semibold'>You will make a payment of 1000 USDC.</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-center mt-4 items-center">
          <Button variant={'outline'} onClickCapture={() => setOpen(false)}>Cancel</Button>
          <Button disabled={isSubmitting} onClick={handleSubmit}>
            Yes, Pay Now!
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
