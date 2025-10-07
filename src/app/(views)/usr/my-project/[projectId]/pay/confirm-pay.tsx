'use client'
import { Icon } from "@/components/icon";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { usePaymentSC } from "@/modules/payment-method/payment.hook";
import { useStateModal } from "@/store/useStateModal";

import { TMasterPayment } from "@/types/payment";
import { TProject } from "@/types/project";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ConfirmPay({ data, project }: { data: TMasterPayment, project: TProject }) {
  const router = useRouter()
  const { open, setOpen } = useStateModal()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { payListingFee } = usePaymentSC()
  function handleChangeOpen() {
    setOpen(!open)
    setIsSubmitting(false)
  }

  function handlePayment() {
    setIsSubmitting(true)
    payListingFee(project, data).then(() => {
      router.replace(`/usr/my-project/${project.id}`)
    }).finally(() => {
      setIsSubmitting(false)
      setOpen(false)
    })
  }

  return (
    <AlertDialog onOpenChange={handleChangeOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button className="w-full">
          Process Payment
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Payment Confirmation</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <div className="text-center">
                <Icon className="text-4xl mx-auto" name="typcn:info" />
                <p>Proceed payment now? This cannot be undone.</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-center mt-4 items-center">
          <Button className="flex-1" variant={'outline'} onClickCapture={() => setOpen(false)}>Cancel</Button>
          <Button className="flex-1" disabled={isSubmitting} onClick={handlePayment}>
            Pay Now!
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
