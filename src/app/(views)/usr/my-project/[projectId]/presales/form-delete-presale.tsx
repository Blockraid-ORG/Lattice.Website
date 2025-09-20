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
import { useDeletePresale } from '@/modules/presales/presale.query'
import { TPresale } from '@/types/project'
import { Trash } from 'lucide-react'
import { useState } from 'react'

export default function FormDeletePresale({ data, }: { data: TPresale }) {
  const { mutate: deletePresale} = useDeletePresale()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  function handleDeploy() {
    setIsSubmitting(true)
    deletePresale(data.id, {
      onSuccess: () => {
        setIsSubmitting(false)
        setOpen(false)
      }
    })
  }
  return (
    <AlertDialog onOpenChange={() => setOpen(!open)} open={open}>
      <AlertDialogTrigger asChild>
        <Button size={'icon-sm'} disabled={!!data?.presaleSCID}>
          <Trash />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Delete Presale</AlertDialogTitle>
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
                <p>Do you want to delete this presale?</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-center mt-4 items-center">
          <Button variant={'outline'} onClickCapture={() => setOpen(false)}>Cancel</Button>
          <Button disabled={isSubmitting} onClick={handleDeploy}>
            Delete
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
