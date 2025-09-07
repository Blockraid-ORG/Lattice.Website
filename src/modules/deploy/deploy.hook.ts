'use client'
import FactoryAbi from '@/lib/abis/factory.abi.json';
import PresaleAbi from '@/lib/abis/presale.abi.json';

import { useVestingStore } from '@/store/useVestingStore';
import { TProject } from '@/types/project';
import { BrowserProvider, ethers } from "ethers";
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAccount, useWalletClient } from 'wagmi';
import {
  useSetAllocationDeploy,
  useSetDistributedLocker,
  useUpdateAllocation
} from '../project/project.query';
import {
  useDeployPresale,
  useDeployProject,
  useDeployWhitelist
} from './deploy.query';

export function useDeployToken() {
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const { mutate: updateAllocation } = useUpdateAllocation()
  const { mutate: setAllocationDeploy } = useSetAllocationDeploy()
  const { mutate: setDistributedLocker } = useSetDistributedLocker()
  const { data: vestings } = useVestingStore()
  const { mutate: deployProject } = useDeployProject()
  const { mutate: deployWhitelist } = useDeployWhitelist()
  const { mutate: deployPresale } = useDeployPresale()

  const deployFactoryContractBasic = useCallback(async () => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)

    const factory = new ethers.ContractFactory(
      FactoryAbi.abi,
      FactoryAbi.bytecode,
      signer
    );

    const contract = await factory.deploy(await signer.getAddress());
    await contract.waitForDeployment();
    return contract;
  }, [address, walletClient]);
  
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

  const deployFactoryBasic = useCallback(async (project: TProject) => {
    try {
      if (typeof window === 'undefined') return
      if (!walletClient || !address) throw new Error('Wallet not connected')
      const second = 24 * 60 * 60;
      const provider = new BrowserProvider(walletClient as any)
      const signer = await provider.getSigner(address)

      const presaleFactory = new ethers.ContractFactory(
        PresaleAbi.abi,
        PresaleAbi.bytecode,
        signer
      );

      const factoryContract = await deployFactoryContractBasic();

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
        const initialSupply = project.totalSupply;

        const presaleAllocation = project.allocations.find(i => i.isPresale)
        const lockerNames = vestings.map(i => i.name);
        const amountSupply = project.totalSupply
        const amounts = vestings.map(i =>
          ethers.parseUnits(
            (Number(amountSupply) * i.supply / 100).toString(),
            project.decimals).toString());
        // const schedulesA = vestings.map(i => {
        //   const valueScedule = Math.round(100 / i.vesting * 100)
        //   const schedule = Array(i.vesting).fill(valueScedule);
        //   return schedule
        // })
        const schedules = vestings.map(i => {
          if (i.vesting === 0) {
            return ["10000"];
          }
          const totalBasisPoints = 10000;
          const base = Math.floor(totalBasisPoints / i.vesting);
          const remainder = totalBasisPoints - (base * i.vesting);
          const schedule = Array(i.vesting).fill(base);
          schedule[i.vesting - 1] += remainder;
          // return schedule;
          return schedule.map(v => v.toString());
        })
        // const durations = vestings.map(i => i.vesting * 30 * second);
        const durations = vestings.map(i => {
          if (i.vesting === 0) return "1"; // jangan kasih 0, kasih 1 detik minimal
          // return i.vesting * 30 * second;
          return (i.vesting * 30 * second).toString();
        });
        const startTimes = vestings.map(i => {
          if (i.vesting === 0) {
            return Math.floor(Date.now() / 1000).toString();
          }
          const originalDate = new Date(i.startDate);
          const newDate = new Date(originalDate);
          newDate.setDate(newDate.getDate() + (Number(i.vesting) * 30));
          // return Math.floor(newDate.getTime() / 1000);
          return Math.floor(newDate.getTime() / 1000).toString();
        })

        console.log({
          schedules,
          durations,
          startTimes,
          amounts,
          lockerNames
        })
        console.log(JSON.stringify({
          schedules,
          durations,
          startTimes,
          amounts,
          lockerNames
        }))
        // return
        const tx = await factory.deployAll(
          tokenName,
          symbol,
          initialSupply,
          project.decimals,
          lockerNames,
          amounts,
          startTimes,
          durations,
          schedules,
        );

        const receipt = await tx.wait();
        const iface = new ethers.Interface(FactoryAbi.abi);
        const result = {
          token: undefined as string | undefined,
          whitelist: undefined as string | undefined,
          lockers: [] as string[],
        };
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog(log);

            if (parsed?.name === "ERC20Deployed") {
              result.token = parsed.args[0];
            }

            if (parsed?.name === "WhitelistDeployed") {
              result.whitelist = parsed.args[0];
            }

            if (parsed?.name === "LockerDeployed") {
              result.lockers.push(parsed.args[0]);
            }
          } catch {
            console.log('Error')
          }
        }
        const originalDate = new Date(project.presales.startDate);
        const newDate = new Date(originalDate);
        newDate.setDate(newDate.getDate()); // + Number(project.presales.duration)
        const startTime = Math.floor(newDate.getTime() / 1000);
        const presale = await presaleFactory.deploy(
          result.token,
          result.whitelist,
          address,
          ethers.parseEther(project.presales.hardcap), // hardCap = 100 ETH,
          ethers.parseEther(project.presales.price), // pricePerToken = 0.002 ETH,
          ethers.parseEther(project.presales.maxContribution), // maxContribution = 5 ETH,
          startTime,
          Number(project.presales.duration) * second, // duration = 7 days,
          Number(project.presales.whitelistDuration) * 60 * 60, // whitelistDuration = 2 days,
          Number(project.presales.claimTime) * second, // claimDelay = 1 day,
          Number(project.presales.sweepDuration) * second, // sweepDuration = 14 days
        );

        await presale.waitForDeployment();

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
                  contractAddress: presale.target as string
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
                contractAddress: presale.target as string
              });

              // Run all promises in parallel (if they are not dependent)
              await Promise.all([
                ...updateVestingAllocations,
                updatePresale,
                deployWhitelistPromise,
                deployPresalePromise
              ]);
            } catch (err: any) {
              toast.error(err.message ?? 'Something went wrong during deployment.');
            }
          }
        })
      }
    } catch (error: any) {
      console.error({ error: error.message })
      toast.error('Something went wrong during deployment.');
    }
  }, [
    deployFactoryContractBasic,
    deployPresale,
    deployProject,
    deployWhitelist,
    setAllocationDeploy,
    updateAllocation,
    address,
    vestings,
    walletClient
  ])
  return {
    lockAndDistribute,
    deployFactoryBasic,
  }
}