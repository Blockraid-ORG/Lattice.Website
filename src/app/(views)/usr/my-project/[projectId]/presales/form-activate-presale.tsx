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

export default function FormActivatePresale({ data, item }: { data: TProject, item: TPresale }) {
  const [open, setOpen] = useState(false)
  const { activatePresale } = useDeployPresaleSC()
  const [isSubmitting, setIsSubmitting] = useState(false)
  function handleActivate() {
    setIsSubmitting(true)
    activatePresale({ data, item }).then(() => {
      setOpen(false)
    }).finally(() => setIsSubmitting(false))

  }
  return (
    <AlertDialog onOpenChange={() => setOpen(!open)} open={open}>
      <AlertDialogTrigger asChild>
        <Button size={'sm'} disabled={!!item?.presaleSCID}>
          {data?.presaleSCID}
          <Icon className='text-base' name='material-symbols-light:upload-sharp' /> Activate
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Activate Presale</AlertDialogTitle>
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
                <p>Do you want to activate this presale?</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-center mt-4 items-center">
          <Button variant={'outline'} onClickCapture={() => setOpen(false)}>Cancel</Button>
          <Button disabled={isSubmitting} onClick={handleActivate}>
            Activate
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
