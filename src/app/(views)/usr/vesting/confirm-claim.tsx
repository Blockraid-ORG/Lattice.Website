import { Icon } from '@/components/icon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { useVestingHook } from '@/modules/client-project/vesting.hook'
import { TMyVetsing } from '@/types/project'
import { useState } from 'react'
import { useSwitchChain } from 'wagmi'
export default function ConfirmClaimVesting({ locker }: { locker: TMyVetsing }) {
  const { switchChain } = useSwitchChain();
  const { claim } = useVestingHook()
  const [open, setOpen] = useState(false)
  function handleClaim() {
    claim(locker)
    setOpen(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    console.log(locker.project?.chains[0].chain.chainid)
    setOpen(isOpen)
    if(isOpen){
      switchChain({
        chainId: locker.project?.chains[0].chain.chainid,
      });
    }
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size={'sm'}>
          <Icon className='text-sm' name="icon-park-solid:folder-withdrawal" /> Claim
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="text-center">Claim Vesting</DialogTitle>
        <div className="text-center">
          <Icon className="text-4xl mx-auto" name="ri:question-fill" />
          <p>Are You sure to claim vesting now?</p>
        </div>
        <div className='flex justify-center mt-4'>
          <Button onClick={handleClaim} size={'lg'}>Claim Now</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
