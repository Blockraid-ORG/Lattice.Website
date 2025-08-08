'use client'
import { Icon } from "@/components/icon"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useDeployToken } from "@/modules/deploy/deploy.hook"
import { useStateModal } from "@/store/useStateModal"
import { TProject } from "@/types/project"
import { useState } from "react"

export function ConfirmDistributeLocker({ data }: { data: TProject }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { openDistribute, setOpenDistribute } = useStateModal()
  const { lockAndDistribute } = useDeployToken()
  async function handleDistribute() {
    setIsSubmitting(true)
    lockAndDistribute(data).then(() => {
      setIsSubmitting(false)
    }).finally(() => setOpenDistribute(false))
  }
  return (
    <AlertDialog onOpenChange={() => setOpenDistribute(!openDistribute)} open={openDistribute}>
      <AlertDialogTrigger asChild>
        <Button
          disabled={!data.contractAddress || data.lockerDistributed}
          size={'lg'}>Distribute Locker</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Distribute Locker</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <div className="text-center">
                <div>
                  {
                    isSubmitting ? (
                      <Icon className="text-4xl mx-auto animate-spin" name="icon-park-outline:loading" />
                    ) : (
                      <Icon className="text-4xl mx-auto" name="mingcute:question-line" />
                    )
                  }
                </div>
                <p>Do you want to distribute locker now?</p>
                <p>
                  You can distribute this now or later.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-center mt-4 items-center">
          <Button variant={'outline'} onClickCapture={() => setOpenDistribute(false)}>Distribute Later</Button>
          <Button disabled={isSubmitting} onClick={handleDistribute}>
            Distribute Now
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
