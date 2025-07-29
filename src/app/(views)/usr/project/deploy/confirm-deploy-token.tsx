'use client'
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { toUrlAsset } from "@/lib/utils"
import { useDeployToken } from "@/modules/deploy/deploy.hook"
import { useDeployProject } from "@/modules/deploy/deploy.query"
import { useStateModal } from "@/store/useStateModal"
import { TProject } from "@/types/project"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"
import { useAccount, useBalance } from "wagmi"

export function ConfirmDeployToken({ data }: { data: TProject }) {
  const [loading, setLoading] = useState(false)
  const { mutate: deployProject } = useDeployProject(data.id)
  const { open, setOpen } = useStateModal()
  const { deploy } = useDeployToken()
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  async function handleChangeOpen(state: boolean) {
    setOpen(state);
  }

  console.log({ data })

  async function handleDeploy() {
    setLoading(true)
    deploy(data)
      .then(response => {
        deployProject({
          projectId: data.id,
          status: 'DEPLOYED',
          note: 'Deployed by project owner',
          contractAddress: response
        })
        toast.success('Success Deploy', {
          description: response
        })
      })
      .catch(error => {
        console.log(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }
  return (
    <Dialog onOpenChange={handleChangeOpen} open={open}>
      <DialogTrigger asChild>
        <Button disabled={data.status === 'DEPLOYED'}>
          {
            data.status === 'DEPLOYED' ? (
              <Icon className="text-lg" name="ic:round-check-box" />
            ) : (
              <Icon className="text-lg" name="mage:box-3d-upload" />
            )
          }
          {
            data.status === 'DEPLOYED' ? 'Deployed' : 'Deploy'
          }

        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Deploy Token</DialogTitle>
          <DialogDescription>
            Deploy Your Project To Blockchain
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="h-24 w-24 border rounded-lg p-2">
            <Image className="w-full h-full object-contain" width={100} height={100} src={toUrlAsset(data.logo)} alt={data?.logo} />
          </div>
          <div className="flex text-sm">
            <div className="w-32">Token Name</div>
            <div className='w-3 shrink-0'>:</div>
            <div className="flex-1 font-semibold">{data.name}</div>
          </div>
          <div className="flex text-sm">
            <div className="w-32">Symbol/Ticker</div>
            <div className='w-3 shrink-0'>:</div>
            <div className="flex-1 font-semibold">{data.ticker}</div>
          </div>

          <div>
            {balance?.value && balance?.value <= 0 && <>Balance Kothong</>}
          </div>
          <div className="flex justify-end">
            <Button disabled={loading} onClick={handleDeploy}>
              {loading && <Icon name="mingcute:loading-fill" className="animate-spin" />}
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
