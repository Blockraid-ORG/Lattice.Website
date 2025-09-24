import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useManageLocker } from "@/modules/manage-locker/manage-locker.hook"
import { TAllocation } from "@/types/project"
import { useState } from "react"

export function ConfirmLocker({ data }: { data: TAllocation }) {
  const [loading, setLoading] = useState(false)
  const { finalizeAllocation } = useManageLocker()
  function handleContinue() {
    setLoading(true)
    finalizeAllocation(data).finally(() => setLoading(false))
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={'default'} disabled={data.isFinalized} size={'sm'}>Finalize!</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will finalize token locker!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={handleContinue}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
