'use client'

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { NumberComma, toUrlAsset } from "@/lib/utils";
import { useProjectDetail } from "@/modules/project/project.query";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useSwitchChain } from "wagmi";
import { ConfirmDeploy } from "./confirm-deploy";
import Stepper from "@/components/stepper";

export default function ReviewProject() {
  const { projectId } = useParams();
  const { data, isLoading } = useProjectDetail(projectId.toString());
  const { switchChain } = useSwitchChain();
  useEffect(() => {
    if (data && data.chains.length > 0) {
      switchChain({
        chainId: data?.chains[0].chain.chainid,
      });
    }
  }, [data, switchChain]);
  return (
    <div className='max-w-2xl mx-auto'>
      {
        !isLoading && data ? (
          <div className="mb-6 bg-white border dark:bg-primary-foreground/50 p-4 rounded-lg">
            <div className="mb-6 relative flex items-center gap-4">
              <div className="h-24 w-24 border rounded-lg p-2">
                <Image className="w-full h-full object-contain" width={100} height={100} src={toUrlAsset(data.logo)} alt={data?.logo} />
              </div>
              <div>
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
                <div className="flex text-sm">
                  <div className="w-32">Total Supply</div>
                  <div className='w-3 shrink-0'>:</div>
                  <div className="flex-1 font-semibold">{NumberComma(+data.totalSupply)}</div>
                </div>
                <div className="flex text-sm">
                  <div className="w-32">Contract</div>
                  <div className='w-3 shrink-0'>:</div>
                  <div className="flex-1 font-semibold break-all">
                    {
                      data.contractAddress ? (
                        <a className="text-xs font-semibold underline text-blue-500 block break-all" href={`${data.chains[0].chain.urlScanner}/address/${data.contractAddress}`} target="_blank" rel="noopener noreferrer">
                          {data.contractAddress}
                        </a>
                      ) : (
                        <div>-</div>
                      )
                    }
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div>
                <h2 className="md:text-lg">Allocations</h2>
              </div>
              {data.allocations.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-dashed text-sm">
                  <div className="flex-1">
                    <div>{item.name !== 'Deployer' ? 'Contract' : ''} {item.name} {`(${item.supply}%)`}</div>
                  </div>
                  <div>
                    {
                      item.contractAddress ? (
                        <Icon className="text-lg text-blue-500" name="lets-icons:check-fill" />
                      ) : (
                        <>
                          {
                            item.isDeploying ? (
                              <Icon className="text-sm animate-spin" name="streamline-ultimate:loading-bold" />
                              ) : (
                                  <>
                                    {
                                      item.name !== "Deployer" && (
                                        <Icon className="text-lg" name="fluent:circle-hint-24-filled" />
                                      )
                                    }
                                  </>
                              
                            )
                          }
                        </>
                      )
                    }
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant={'outline'} size={'lg'} asChild>
                <Link href={'/usr/my-project'}>Cancel</Link>
              </Button>
              <ConfirmDeploy data={data} />
            </div>
          </div>
        ) : (
          <div>Loading data...</div>
        )
      }
      <Stepper />
    </div>
  )
}
