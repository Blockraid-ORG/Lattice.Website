'use client'
import lockerAbi from '@/abi/locker.abi.json';
import tokenAbi from '@/abi/token.abi.json';
import whitelistAbi from '@/abi/whitelist.abi.json';
import presaleAbi from '@/abi/presale.abi.json';
import { useStateModal } from '@/store/useStateModal';

import { useVestingStore } from '@/store/useVestingStore';
import { TProject } from '@/types/project';
import { BrowserProvider, ethers } from "ethers";
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAccount, useWalletClient } from 'wagmi';
import { useSetAllocationDeploy, useUpdateAllocation } from '../project/project.query';
import { useDeployPresale, useDeployProject, useDeployWhitelist } from './deploy.query';


export function useDeployToken() {
  const { setOpen } = useStateModal()
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const { mutate: updateAllocation } = useUpdateAllocation()
  const { mutate: setAllocationDeploy } = useSetAllocationDeploy()
  const { data: vestings } = useVestingStore()
  const { mutate: deployProject } = useDeployProject()
  const { mutate: deployWhitelist } = useDeployWhitelist()
  const { mutate: deployPresale } = useDeployPresale()

  const deployToken = useCallback(async (project: TProject) => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')

    try {
      const presaleAllocation = project.allocations.find(i => i.isPresale)
      const provider = new BrowserProvider(walletClient as any)
      const signer = await provider.getSigner(address)
      const tokenFactory = new ethers.ContractFactory(tokenAbi.abi, tokenAbi.bytecode, signer)
      const lockerFactory = new ethers.ContractFactory(lockerAbi.abi, lockerAbi.bytecode, signer)
      const whitelistFactory = new ethers.ContractFactory(whitelistAbi.abi, whitelistAbi.bytecode, signer)
      const presaleFactory = new ethers.ContractFactory(presaleAbi.abi, presaleAbi.bytecode, signer)

      const tokenERC20 = await tokenFactory.deploy(
        project.name,
        project.ticker,
        project.totalSupply
      )
      await tokenERC20.waitForDeployment()
      deployProject({
        projectId: project.id,
        status: 'DEPLOYED',
        note: 'Deployed by project owner',
        contractAddress: tokenERC20.target as string
      }, {
        onSuccess: () => {
          toast.success(`Success Deploy Contract ${project.name}`, {
            description: tokenERC20.target as string,
            position: 'top-center'
          })
          // ========
          setAllocationDeploy({
            projectId: project.id,
            allocations: vestings.map(i => {
              return {
                id: i.id
              }
            })
          })
          // ========
        }
      })

      // Deploy Locker
      for (let i = 0; i < vestings.length; i++) {
        const allocation = vestings[i];
        toast.loading('Deploy Vesting', {
          description: `Starting Deploy ${allocation.name}`,
          position: 'top-center'
        })
        const durationMonth = allocation.vesting * 30;
        const duration = durationMonth * 24 * 60 * 60;
        const valueScedule = Math.round(100 / allocation.vesting * 100)
        const schedule = Array(allocation.vesting).fill(valueScedule);

        if (tokenERC20.target) {
          const token = await lockerFactory.deploy(
            allocation.name,
            tokenERC20.target as string,
            duration,
            schedule
          )
          await token.waitForDeployment()
          toast.dismiss();
          toast.success(`Success Deploy Contract ${allocation.name}`, {
            description: token.target as string,
            position: 'top-center'
          })
          // ========
          updateAllocation({
            projectId: project.id,
            id: allocation.id,
            contractAddress: token.target as string
          })
          // ========
        }
      }

      if (presaleAllocation) {
        setAllocationDeploy({
          projectId: project.id,
          allocations: [{
            id: presaleAllocation?.id
          }]
        })
      }
      // Deploy Whitelist

      const responseWhitelistFactory = await whitelistFactory.deploy()
      await responseWhitelistFactory.waitForDeployment()

      // ========
      deployWhitelist({
        id: project.presales.id,
        whitelistContract: responseWhitelistFactory.target as string
      })
      // ========
      // Deploy Presale
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 600;
      const responsePresaleFactory = await presaleFactory.deploy(
        tokenERC20.target as string,
        responseWhitelistFactory.target as string,
        project.presales.hardcap,
        project.presales.price,
        project.presales.maxContribution,
        startTime,
        Number(project.presales.duration) * 24 * 60 * 60,
        1 * 24 * 60 * 60,
        Number(project.presales.claimTime) * 24 * 60 * 60,
        // 2 * 24 * 60 * 60,
      )
      await responsePresaleFactory.waitForDeployment()
      if (presaleAllocation) {
        updateAllocation({
          projectId: project.id,
          id: presaleAllocation?.id,
          contractAddress: responsePresaleFactory.target as string
        })
      }
      toast.loading('Deploy Presale', {
        description: `Starting Deploy Presale, Please wait`,
        position: 'top-center'
      })
      deployPresale({
        id: project.presales.id,
        whitelistContract: responseWhitelistFactory.target as string,
        contractAddress: responsePresaleFactory.target as string
      }, {
        onSuccess: () => {
          toast.dismiss()
          toast.success(`Congratulation`, {
            description: `Your Token (${project.ticker}) ${project.name} has beed deployed to blockchain!!!`,
            position: 'top-center',
            action: {
              label: `View on ${project.chains[0].chain.name}`,
              onClick: () => {
                window.open(`${project.chains[0].chain.urlScanner}/address/${tokenERC20.target}`, '_blank')
              },
            }
          })
        }
      })
      // SAVE TO DB
      setOpen(false)
      return tokenERC20.target as string
    } catch (error: any) {
      setOpen(false)
      toast.error(`${error?.code ?? 'Rejected'}`, {
        description: `${error.shortMessage ?? 'Action Error, there is something wrong!'}`,
        position: 'top-center'
      })
    }
  }, [walletClient, address, deployProject, deployWhitelist, deployPresale, setOpen, setAllocationDeploy, vestings, updateAllocation])
  return {
    deployToken,
  }
}