'use client'
import { Icon } from "@/components/icon";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeployToken } from "@/modules/deploy/deploy.hook";
import { useStateModal } from "@/store/useStateModal";

import { useVestingStore } from "@/store/useVestingStore";
import { TProject } from "@/types/project";
import { useState } from "react";

export function ConfirmDeploy({ data }: { data: TProject }) {
  const { deployFactoryBasic } = useDeployToken()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setData: setDataVesting } = useVestingStore()
  const { open, setOpen } = useStateModal()

  function handleChangeOpen() {
    setOpen(!open)
    setDataVesting(data.allocations)
  }

  async function handleDeployContract() {
    setIsSubmitting(true)
    deployFactoryBasic(data).finally(() => setIsSubmitting(false))
    setOpen(false)
  }

  return (
    <AlertDialog onOpenChange={handleChangeOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button size={'lg'}>
          Deploy Now!
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Confirm Deployment</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <div className="text-center">
                <Icon className="text-4xl mx-auto" name="typcn:info" />
                <p>Proceed with deployment? This cannot be undone.</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-center mt-4 items-center">
          <Button className="flex-1" variant={'outline'} onClickCapture={() => setOpen(false)}>Cancel</Button>
          <Button className="flex-1" disabled={isSubmitting} onClick={handleDeployContract}>
            Deploy Now!
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
