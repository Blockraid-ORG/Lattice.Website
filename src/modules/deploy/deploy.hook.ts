'use client'
import FactoryAbi from '@/lib/abis/factory.abi.json';
import { useStateModal } from '@/store/useStateModal';

import { useVestingStore } from '@/store/useVestingStore';
import { TProject } from '@/types/project';
import { BrowserProvider, ethers } from "ethers";
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAccount, useWalletClient } from 'wagmi';
import { useSetAllocationDeploy, useSetDistributedLocker, useUpdateAllocation } from '../project/project.query';
import { useDeployPresale, useDeployProject, useDeployWhitelist } from './deploy.query';


export function useDeployToken() {
  const { setOpen, setOpenDistribute } = useStateModal()
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const { mutate: updateAllocation } = useUpdateAllocation()
  const { mutate: setAllocationDeploy } = useSetAllocationDeploy()
  const { mutate: setDistributedLocker } = useSetDistributedLocker()
  const { data: vestings } = useVestingStore()
  const { mutate: deployProject } = useDeployProject()
  const { mutate: deployWhitelist } = useDeployWhitelist()
  const { mutate: deployPresale } = useDeployPresale()

  const deployFactoryContract = useCallback(async () => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)

    const factory = new ethers.ContractFactory(
      FactoryAbi.abi,
      FactoryAbi.bytecode,
      signer
    );

    const contract = await factory.deploy();
    await contract.waitForDeployment();

    return contract;
  }, [address, walletClient]);

  const deployAll = useCallback(async (project: TProject) => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    try {
      const second = 24 * 60 * 60;
      const presaleAllocation = project.allocations.find(i => i.isPresale)
      const provider = new BrowserProvider(walletClient as any)
      const signer = await provider.getSigner(address)

      const factoryContract = await deployFactoryContract();
      if (factoryContract?.target) {
        setAllocationDeploy({
          projectId: project.id,
          allocations: vestings.map(i => {
            return {
              id: i.id
            }
          })
        })
        const factory = new ethers.Contract(factoryContract.target, FactoryAbi.abi, signer);
        const tokenName = project.name;
        const symbol = project.ticker;
        const initialSupply = ethers.parseEther(project.totalSupply);

        const lockerNames = vestings.map(i => i.name);
        const amounts = vestings.map(i => ethers.parseEther(i.supply.toString()));
        const schedules = vestings.map(i => {
          const valueScedule = Math.round(100 / i.vesting * 100)
          const schedule = Array(i.vesting).fill(valueScedule);
          return schedule
        })

        let presaleParams;
        if (presaleAllocation) {
          const originalDate = new Date(project.presales.startDate);
          const newDate = new Date(originalDate);
          newDate.setDate(newDate.getDate() + Number(project.presales.duration));
          const startTime = Math.floor(newDate.getTime() / 1000);
          presaleParams = [
            ethers.parseEther(project.presales.hardcap), // hardCap = 100 ETH
            ethers.parseEther(project.presales.price), // pricePerToken = 0.002 ETH
            ethers.parseEther(project.presales.maxContribution), // maxContribution = 5 ETH
            startTime, // startTime = block.timestamp + 3 days (e.g., 2025-08-08)
            Number(project.presales.duration) * second, // duration = 7 days
            Number(project.presales.whitelistDuration) * second, // whitelistDuration = 2 days
            Number(project.presales.claimTime) * second, // claimDelay = 1 day
            Number(project.presales.sweepDuration) * second, // sweepDuration = 14 days
          ]
        }
        const durations = vestings.map(i => i.vesting * 30 * second);
        const startTimes = vestings.map(i => {
          const originalDate = new Date(i.startDate);
          const newDate = new Date(originalDate);
          newDate.setDate(newDate.getDate() + (Number(i.vesting) * 30));
          return Math.floor(newDate.getTime() / 1000);
        })

        const tx = await factory.deployAll(
          tokenName,
          symbol,
          initialSupply,
          lockerNames,
          amounts,
          startTimes,
          durations,
          schedules,
          presaleParams,
          project.decimals
        );

        const receipt = await tx.wait();
        const iface = new ethers.Interface(FactoryAbi.abi);
        const result = {
          token: undefined as string | undefined,
          whitelist: undefined as string | undefined,
          lockers: [] as string[],
          presale: undefined as string | undefined,
        };
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog(log);
            switch (parsed?.name) {
              case "ERC20Deployed":
                result.token = parsed.args.tokenAddress;
                break;
              case "WhitelistDeployed":
                result.whitelist = parsed.args.whitelistAddress;
                break;
              case "LockerDeployed":
                result.lockers.push(parsed.args.lockerAddress);
                break;
              case "PresaleDeployed":
                result.presale = parsed.args.presaleAddress;
                break;
            }
          } catch (e) {
            console.log(e)
            // Ignore logs that don’t match ABI
          }
        }
        deployProject({
          projectId: project.id,
          status: 'DEPLOYED',
          note: 'Deployed by project owner',
          contractAddress: result.token as string,
          factoryAddress: factoryContract?.target as string,
        }, {
          onSuccess: async () => {
            try {
              toast.success(`Success Deploy Contract ${project.name}`, {
                description: result.token as string,
                position: 'top-center'
              });

              // 1. Update all vesting allocations (parallel)
              const updateVestingAllocations = result.lockers.map((lockerItem, i) =>
                updateAllocation({
                  projectId: project.id,
                  id: vestings[i].id,
                  contractAddress: lockerItem as string
                })
              );

              // 2. Update presale allocation (if exists)
              const updatePresale = presaleAllocation
                ? updateAllocation({
                  projectId: project.id,
                  id: presaleAllocation.id,
                  contractAddress: result.presale as string
                })
                : Promise.resolve();

              // 3. Deploy whitelist and presale
              const deployWhitelistPromise = deployWhitelist({
                id: project.presales.id,
                whitelistContract: result.whitelist as string
              });

              const deployPresalePromise = deployPresale({
                id: project.presales.id,
                whitelistContract: result.whitelist as string,
                contractAddress: result.presale as string
              });

              // Run all promises in parallel (if they are not dependent)
              await Promise.all([
                ...updateVestingAllocations,
                updatePresale,
                deployWhitelistPromise,
                deployPresalePromise
              ]);
              setOpenDistribute(true)
            } catch (err) {
              toast.error('Something went wrong during deployment.');
              console.error(err);
            }
          }
        })
        return receipt;
      }

    } catch (error: any) {
      setOpen(false)
      toast.error(`${error?.code ?? 'Rejected'}`, {
        description: `${error.shortMessage ?? 'Action Error, there is something wrong!'}`,
        position: 'top-center'
      })
    }
  }, [
    address,
    deployFactoryContract,
    deployPresale,
    deployProject,
    deployWhitelist,
    setAllocationDeploy,
    setOpen,
    updateAllocation,
    vestings,
    walletClient,
    setOpenDistribute,
  ])

  const lockAndDistribute = useCallback(async (project: TProject) => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    const amounts = vestings.map(i => ethers.parseEther(i.supply.toString()));
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)
    if (project.factoryAddress) {
      const factory = new ethers.Contract(
        project.factoryAddress,
        FactoryAbi.abi,
        signer
      );
      const contract = await factory.lockAndDistribute(amounts);
      setDistributedLocker({
        projectId: project.id,
        lockerDistribution: {
          id: project.id,
          lockerDistributeHash: contract.hash
        }
      })
      return amounts

    }

  }, [address, setDistributedLocker, vestings, walletClient])

  return {
    deployAll,
    lockAndDistribute
  }
}