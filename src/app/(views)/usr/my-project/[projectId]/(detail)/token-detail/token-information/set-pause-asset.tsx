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
import { useDeployToken } from '@/modules/deploy/deploy.hook'
import { TProject } from '@/types/project'
import { useState } from 'react'
export default function SetPauseAsset({ data }: { data: TProject }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const { setPauseAsset } = useDeployToken()
  async function handleSubmit() {
    setIsSubmitting(true)
    setPauseAsset(data).finally(() => {
      setOpen(false)
      setIsSubmitting(false)
    })
  }
  return (
    <AlertDialog onOpenChange={() => setOpen(!open)} open={open}>
      <AlertDialogTrigger asChild>
        <div className='flex items-center justify-between gap-2 flex-1'>
          {
            !data.paused ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div> Unpaused
                </div>
                <Button disabled={data.status !== 'DEPLOYED'}>
                  <Icon name="material-symbols:pause-rounded" />
                  Pause
                </Button>
              </>
            ) : (
              <>

                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div> Paused
                </div>
                <Button>
                  <Icon name="mingcute:play-fill" />
                  Unpause
                </Button>
              </>
            )
          }
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">{!data.paused ? 'Pause' : 'Unpause'} Asset</AlertDialogTitle>
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
                <p>Do you want to {!data.paused ? 'pause' : 'unpause'} Asset?</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-center mt-4 items-center">
          <Button variant={'outline'} onClickCapture={() => setOpen(false)}>Cancel</Button>
          <Button disabled={isSubmitting} onClick={handleSubmit}>
            Yes, {!data.paused ? 'Pause' : 'Unpause'} Asset
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
