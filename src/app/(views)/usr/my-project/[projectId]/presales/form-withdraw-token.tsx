import { Icon } from '@/components/icon'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useDeployPresaleSC } from '@/modules/presales/presale.deploy'
import { TPresale, TProject } from '@/types/project'
import { useState } from 'react'

export default function FormWithdrawToken({ data, item }: { data: TProject, item: TPresale }) {
  const [open, setOpen] = useState(false)
  const { sweepUnclaimedTokens } = useDeployPresaleSC()
  const [isSubmitting, setIsSubmitting] = useState(false)
  function handleActivate() {
    setIsSubmitting(true)
    sweepUnclaimedTokens({ data, item }).then(() => {
      setOpen(false)
    }).finally(() => setIsSubmitting(false))
  }
  return (
    <AlertDialog onOpenChange={() => setOpen(!open)} open={open}>
      <AlertDialogTrigger asChild>
        <Button size={'sm'} disabled={item.isWithdrawn || !item.presaleSCID}>
          <Icon className='text-base' name='hugeicons:reverse-withdrawal-01' /> Withdraw Token
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Withdraw Token</AlertDialogTitle>
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
                <p>Do you want to withdraw token from this presale?</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-center mt-4 items-center">
          <Button variant={'outline'} onClickCapture={() => setOpen(false)}>Cancel</Button>
          <Button disabled={isSubmitting} onClick={handleActivate}>
            Withdraw
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

