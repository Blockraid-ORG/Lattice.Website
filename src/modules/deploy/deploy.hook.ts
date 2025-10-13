'use client'
import FactoryAbi from '@/lib/abis/factory.abi.json';
import PresaleAbi from '@/lib/abis/presale.abi.json';
import ERC20Abi from '@/lib/abis/erc20.abi.json';

import { useVestingStore } from '@/store/useVestingStore';
import { TProject } from '@/types/project';
import { BrowserProvider, ethers } from "ethers";
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAccount, useWalletClient } from 'wagmi';
import {
  useSetAllocationDeploy,
  useSetDistributedLocker,
  useSetPauseProject,
  useSetRewardContractAddress,
  useUpdateAllocation
} from '../project/project.query';
import { useDeployProject } from './deploy.query';
import { TMasterPayment } from '@/types/payment';
import { successMessage } from '@/lib/notification';

export function useDeployToken() {
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const { mutate: updateAllocation } = useUpdateAllocation()
  const { mutate: setAllocationDeploy } = useSetAllocationDeploy()
  const { mutate: setDistributedLocker } = useSetDistributedLocker()
  const { mutate: setRewardContractAddress } = useSetRewardContractAddress()
  const { mutate: setPauseProject } = useSetPauseProject()
  const { data: vestings } = useVestingStore()
  const { mutate: deployProject } = useDeployProject()

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

  const deployFactoryBasic = useCallback(async (project: TProject, addressPool: TMasterPayment) => {
    if (!addressPool) {
      toast.error('Error', {
        description: 'Payment address not found!'
      })
    }

    
    const _platformFeeBps = addressPool.presaleFee * 100;
    const _platform = addressPool.paymentSc;
    const _sweepDuration = project.sweepDuration ?? (60 * 60 * 24) * 30;
    const _whitelistDuration = project.whitelistDuration ? project.whitelistDuration * 60 * 60 * 24 : 0
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

        const durations = vestings.map(i => {
          if (i.vesting === 0) return "1";
          return (i.vesting * 30 * second).toString();
        });
        const startTimes = vestings.map(i => {
          if (i.vesting === 0) {
            return Math.floor(Date.now() / 1000).toString();
          }
          const originalDate = new Date(i.startDate);
          const newDate = new Date(originalDate);
          newDate.setDate(newDate.getDate() + 2);
          return Math.floor(newDate.getTime() / 1000).toString();
        })
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
          airdrop: undefined as string | undefined,
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
            if (parsed?.name === "AirdropDeployed") {
              result.airdrop = parsed.args[0];
            }
          } catch {
            console.log('Error')
          }
        }
        // Deploy Presale Factory
        const presale = await presaleFactory.deploy(
          address,
          _platform,
          _platformFeeBps,
          result.token,
          result?.whitelist,
          _whitelistDuration,
          _sweepDuration
        );
        await presale.waitForDeployment();
        deployProject({
          projectId: project.id,
          status: 'DEPLOYED',
          note: 'Deployed by project owner',
          contractAddress: result.token as string,
          factoryAddress: factoryContract?.target as string,
          presaleAddress: presale?.target as string,
          whitelistsAddress: result?.whitelist as string
        }, {
          onSuccess: async () => {
            try {
              // toast.success(`Success Deploy Contract ${project.name}`, {
              //   description: result.token as string,
              //   position: 'top-center'
              // });

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
              const setRewardContractAddressPromise = setRewardContractAddress({
                projectId: project.id,
                rewardContract: {
                  id: project.id,
                  rewardContractAddress: result.airdrop as string
                }
              });

              await Promise.all([
                ...updateVestingAllocations,
                updatePresale,
                setRewardContractAddressPromise
              ]);
              successMessage(
                {
                  header: 'Sucess',
                  description: `Success deploy asset ${project.name}`
                },
                {
                  label: 'View',
                  url: `${project.chains[0].chain.urlScanner}/address/${result.token}`
                }
              )
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
  }, [walletClient, address, deployFactoryContractBasic, setAllocationDeploy, vestings, deployProject, updateAllocation, setRewardContractAddress])

  const setPauseAsset = useCallback(async (project: TProject) => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)
    if (!project.contractAddress) {
      toast.warning('Warning', {
        description: `Asset not deployed yet`
      })
      return
    }
    const erc20Contract = new ethers.Contract(
      project.contractAddress,
      ERC20Abi.abi,
      signer
    );
    try {
      if (!project.paused) {
        await erc20Contract.pause()
        // tx.await()
      } else {
        await erc20Contract.unpause()
        // tx.await()
      }
      setPauseProject(project.id, {
        onSuccess: () => {
          toast.success('Success', {
            description: `Success ${project.paused ? 'Pause' : 'Unpause'} Asset`
          })
        }
      })

    } catch (error: any) {
      console.error("Change Status Asset failed:", error)
    }

  }, [address, setPauseProject, walletClient]);
  return {
    lockAndDistribute,
    deployFactoryBasic,
    setPauseAsset
  }
}