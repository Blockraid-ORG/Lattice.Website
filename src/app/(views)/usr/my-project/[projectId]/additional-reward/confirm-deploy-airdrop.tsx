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
import { useUpdateAdditionalReward } from '@/modules/additional-rewards/additional-reward.query'
import { useAirdrop } from '@/modules/deploy/deploy.airdrop'
import { TAdditionalReward } from '@/types/project'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ConfirmDeployAirdrop({ data,}: { data: TAdditionalReward}) {
  const { mutate: setContractAddressAirdrop } = useUpdateAdditionalReward(data.id)
  const { deployAirdrop } = useAirdrop()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  function handleDeploy() {
    setIsSubmitting(true)
    deployAirdrop(data).then(async (contract: any) => {
      if (contract)
        setContractAddressAirdrop({
          contractAddress: contract.rewardContractAddress || '',
          scheduleId: contract.scheduleId || ''
        }, {
          onSuccess: () => {
            toast.success('Success', {
              description: "Success deploy airdrop!"
            })
            setIsSubmitting(false)
            setOpen(false)
          },
          onError: () => {
            setIsSubmitting(false)
            toast.error('Error', {
              description: "Fail to deploy airdrop!"
            })
          }
        })
    }).finally(() => {
      setIsSubmitting(false)
      setOpen(false)
    })
  }
  return (
    <AlertDialog onOpenChange={() => setOpen(!open)} open={open}>
      <AlertDialogTrigger asChild>
        <Button
          className='w-full'
          disabled={!!data.contactAddress}
          size={'sm'}
        >
          <Icon name='hugeicons:blockchain-02' />
          Deploy
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Deploy Airdrop</AlertDialogTitle>
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
                <p>Do you want to deploy airdrop now?</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-center mt-4 items-center">
          <Button variant={'outline'} onClickCapture={() => setOpen(false)}>Cancel</Button>
          <Button disabled={isSubmitting} onClick={handleDeploy}>
            Deploy Now!
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
