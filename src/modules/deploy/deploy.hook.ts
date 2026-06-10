'use client'

import FactoryAbi from '@/lib/abis/factory.abi.json';
import PresaleAbi from '@/lib/abis/presale.abi.json';
import ERC20Abi from '@/lib/abis/erc20.abi.json';

import { useVestingStore } from '@/store/useVestingStore';
import { TFormPredictVanity, TProject } from '@/types/project';

import { BrowserProvider, ethers } from "ethers";

import { useCallback } from 'react';

import { toast } from 'sonner';

import { useAccount } from 'wagmi';

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

import { TSignVanityResponse } from '@/types/auth';

import contractService from './contract.service';

async function getSigner() {
  if (typeof window === 'undefined') {
    throw new Error('Window not found');
  }

  const ethereum = (window as any).ethereum;

  if (!ethereum) {
    throw new Error('Ethereum provider not found');
  }

  const provider = new BrowserProvider(
    ethereum
  );

  return provider.getSigner();
}

export function useDeployToken() {
  const { address } = useAccount();

  const { mutate: updateAllocation } =
    useUpdateAllocation();

  const { mutate: setAllocationDeploy } =
    useSetAllocationDeploy();

  const { mutate: setDistributedLocker } =
    useSetDistributedLocker();

  const {
    mutate: setRewardContractAddress
  } = useSetRewardContractAddress();

  const { mutate: setPauseProject } =
    useSetPauseProject();

  const { data: vestings } =
    useVestingStore();

  const { mutate: deployProject } =
    useDeployProject();

  async function predictVanityAddress(
    form: TFormPredictVanity
  ) {
    const res =
      await contractService.PREDICT_VANITY(
        form
      );

    return res;
  }

  const deployFactoryContractBasic =
    useCallback(async () => {
      if (typeof window === 'undefined')
        return;

      if (!address) {
        throw new Error(
          'Wallet not connected'
        );
      }

      const signer = await getSigner();

      const factory =
        new ethers.ContractFactory(
          FactoryAbi.abi,
          FactoryAbi.bytecode,
          signer
        );

      const contract =
        await factory.deploy(
          await signer.getAddress()
        );

      await contract.waitForDeployment();

      return contract;
    }, [address]);

  const lockAndDistribute =
    useCallback(
      async (project: TProject) => {
        if (
          typeof window === 'undefined'
        )
          return;

        if (!address) {
          throw new Error(
            'Wallet not connected'
          );
        }

        const amounts = vestings.map(
          (i) =>
            ethers.parseEther(
              i.supply.toString()
            )
        );

        const signer =
          await getSigner();

        if (project.factoryAddress) {
          const factory =
            new ethers.Contract(
              project.factoryAddress,
              FactoryAbi.abi,
              signer
            );

          const contract =
            await factory.lockAndDistribute(
              amounts
            );

          setDistributedLocker({
            projectId: project.id,
            lockerDistribution: {
              id: project.id,
              lockerDistributeHash:
                contract.hash,
            },
          });

          return amounts;
        }
      },
      [
        address,
        setDistributedLocker,
        vestings,
      ]
    );

  const deployFactoryBasic =
    useCallback(
      async (
        project: TProject,
        addressPool: TMasterPayment,
        responseSign: TSignVanityResponse
      ) => {
        if (!addressPool) {
          toast.error('Error', {
            description:
              'Payment address not found!',
          });

          return;
        }

        const _platformFeeBps =
          addressPool.presaleFee * 100;

        const _platform =
          addressPool.paymentSc;

        const _sweepDuration =
          project.sweepDuration ??
          (60 * 60 * 24) * 30;

        const _whitelistDuration =
          project.whitelistDuration
            ? project.whitelistDuration *
            60 *
            60 *
            24
            : 0;

        try {
          if (
            typeof window === 'undefined'
          )
            return;

          if (!address) {
            throw new Error(
              'Wallet not connected'
            );
          }

          const second = 24 * 60 * 60;

          const signer =
            await getSigner();

          const presaleFactory =
            new ethers.ContractFactory(
              PresaleAbi.abi,
              PresaleAbi.bytecode,
              signer
            );

          const factoryContract =
            await deployFactoryContractBasic();

          if (factoryContract?.target) {
            const responsePredict =
              await predictVanityAddress({
                factoryAddress:
                  factoryContract.target as string,
                address,
                name: project.name,
                symbol: project.ticker,
                decimals:
                  project.decimals.toString(),
                suffix: '77',
                supply:
                  project.totalSupply,
                rpc: project.chains[0]
                  .chain.urlRpc,
                message:
                  responseSign.message,
                signature:
                  responseSign.signature,
              });

            setAllocationDeploy({
              projectId: project.id,
              allocations: vestings.map(
                (i) => ({
                  id: i.id,
                })
              ),
            });

            const factory =
              new ethers.Contract(
                factoryContract.target,
                FactoryAbi.abi,
                signer
              );

            const presaleAllocation =
              project.allocations.find(
                (i) => i.isPresale
              );

            const lockerNames =
              vestings.map(
                (i) => i.name
              );

            const amountSupply =
              project.totalSupply;

            const amounts = vestings.map(
              (i) =>
                ethers.parseUnits(
                  (
                    (Number(
                      amountSupply
                    ) *
                      i.supply) /
                    100
                  ).toString(),
                  project.decimals
                ).toString()
            );

            const schedules =
              vestings.map((i) => {
                if (i.vesting === 0) {
                  return ['10000'];
                }

                const totalBasisPoints =
                  10000;

                const base = Math.floor(
                  totalBasisPoints /
                  i.vesting
                );

                const remainder =
                  totalBasisPoints -
                  base * i.vesting;

                const schedule =
                  Array(i.vesting).fill(
                    base
                  );

                schedule[
                  i.vesting - 1
                ] += remainder;

                return schedule.map(
                  (v) => v.toString()
                );
              });

            const durations =
              vestings.map((i) => {
                if (i.vesting === 0)
                  return '1';

                return (
                  i.vesting *
                  30 *
                  second
                ).toString();
              });

            const startTimes =
              vestings.map((i) => {
                if (i.vesting === 0) {
                  return Math.floor(
                    Date.now() / 1000
                  ).toString();
                }

                const originalDate =
                  new Date(
                    i.startDate
                  );

                return Math.floor(
                  originalDate.getTime() /
                  1000
                ).toString();
              });

            const tx =
              await factory.deployAll(
                responsePredict.initCode,
                lockerNames,
                amounts,
                startTimes,
                durations,
                schedules,
                responsePredict.salt
              );

            const receipt =
              await tx.wait();

            const iface =
              new ethers.Interface(
                FactoryAbi.abi
              );

            const result = {
              token: undefined as
                | string
                | undefined,
              whitelist: undefined as
                | string
                | undefined,
              airdrop: undefined as
                | string
                | undefined,
              lockers: [] as string[],
            };

            for (const log of receipt.logs) {
              try {
                const parsed =
                  iface.parseLog(log);

                if (
                  parsed?.name ===
                  'ERC20Deployed'
                ) {
                  result.token =
                    parsed.args[0];
                }

                if (
                  parsed?.name ===
                  'WhitelistDeployed'
                ) {
                  result.whitelist =
                    parsed.args[0];
                }

                if (
                  parsed?.name ===
                  'LockerDeployed'
                ) {
                  result.lockers.push(
                    parsed.args[0]
                  );
                }

                if (
                  parsed?.name ===
                  'AirdropDeployed'
                ) {
                  result.airdrop =
                    parsed.args[0];
                }
              } catch {
                console.log('Error');
              }
            }

            const presale =
              await presaleFactory.deploy(
                address,
                _platform,
                _platformFeeBps,
                result.token,
                result.whitelist,
                _whitelistDuration,
                _sweepDuration
              );

            await presale.waitForDeployment();

            deployProject(
              {
                projectId: project.id,
                status: 'DEPLOYED',
                note: 'Deployed by project owner',
                contractAddress:
                  result.token as string,
                factoryAddress:
                  factoryContract.target as string,
                presaleAddress:
                  presale.target as string,
                whitelistsAddress:
                  result.whitelist as string,
              },
              {
                onSuccess:
                  async () => {
                    try {
                      const updateVestingAllocations =
                        result.lockers.map(
                          (
                            lockerItem,
                            i
                          ) =>
                            updateAllocation(
                              {
                                projectId:
                                  project.id,
                                id: vestings[i]
                                  .id,
                                contractAddress:
                                  lockerItem as string,
                              }
                            )
                        );

                      const updatePresale =
                        presaleAllocation
                          ? updateAllocation(
                            {
                              projectId:
                                project.id,
                              id: presaleAllocation.id,
                              contractAddress:
                                presale.target as string,
                            }
                          )
                          : Promise.resolve();

                      const setRewardContractAddressPromise =
                        setRewardContractAddress(
                          {
                            projectId:
                              project.id,
                            rewardContract:
                            {
                              id: project.id,
                              rewardContractAddress:
                                result.airdrop as string,
                            },
                          }
                        );

                      await Promise.all(
                        [
                          ...updateVestingAllocations,
                          updatePresale,
                          setRewardContractAddressPromise,
                        ]
                      );

                      successMessage(
                        {
                          header:
                            'Success',
                          description:
                            'Contracts deployed successfully!',
                        },
                        {
                          label:
                            'View',
                          url: `${project.chains[0].chain.urlScanner}/address/${result.token}`,
                        }
                      );
                    } catch (
                    err: any
                    ) {
                      toast.error(
                        err.message ??
                        'Something went wrong during deployment.'
                      );
                    }
                  },
              }
            );
          }
        } catch (error: any) {
          console.error({
            error:
              error.message,
          });

          toast.error(
            'Something went wrong during deployment.'
          );
        }
      },
      [
        address,
        deployFactoryContractBasic,
        setAllocationDeploy,
        vestings,
        deployProject,
        updateAllocation,
        setRewardContractAddress,
      ]
    );

  const setPauseAsset =
    useCallback(
      async (project: TProject) => {
        if (
          typeof window === 'undefined'
        )
          return;

        if (!address) {
          throw new Error(
            'Wallet not connected'
          );
        }

        const signer =
          await getSigner();

        if (!project.contractAddress) {
          toast.warning('Warning', {
            description:
              'Asset not deployed yet',
          });

          return;
        }

        const erc20Contract =
          new ethers.Contract(
            project.contractAddress,
            ERC20Abi.abi,
            signer
          );

        try {
          if (!project.paused) {
            await erc20Contract.pause();
          } else {
            await erc20Contract.unpause();
          }

          setPauseProject(
            project.id,
            {
              onSuccess: () => {
                toast.success(
                  'Success',
                  {
                    description: `Success ${project.paused
                        ? 'Pause'
                        : 'Unpause'
                      } Asset`,
                  }
                );
              },
            }
          );
        } catch (error: any) {
          console.error(
            'Change Status Asset failed:',
            error
          );
        }
      },
      [address, setPauseProject]
    );

  return {
    lockAndDistribute,
    deployFactoryBasic,
    setPauseAsset,
    deployFactoryContractBasic,
  };
}