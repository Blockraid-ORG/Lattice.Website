"use client";
import { Icon } from "@/components/icon";
import { cn, NumberComma, toUrlAsset } from "@/lib/utils";

import BadgeProjectStatus from "@/components/badges/badge-project-status";
import { TProject } from "@/types/project";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DeployFactoryToken } from "../../../../deploy/deploy-factory-token";
import Allocations from "../../allocations";
import ChartAllocations from "../../chart-allocations";
import { ReviewLog } from "../../review-log";
import RowItem from "../../row-item";
import TokenSats from "../../token-stats/token-information/content";
import PresaleManagement from "../presales";
import SetPauseAsset from "./set-pause-asset";
import SetPaymentProject from "./set-payment-project";
import { TMasterPayment } from "@/types/payment";
import { TPagination } from "@/types/pagination";

export default function TokenInformation({ data, addressPool }: { data: TProject, addressPool?: TPagination<TMasterPayment> }) {
  const search = useSearchParams()
  const tabActive = search.get('tab')
  return (
    <>
      {data && (
        <div className="relative pb-8">
          <div className="sticky top-[70px] backdrop-blur flex items-center z-20">
            <Link href={`?tab=INFO`} className={cn(
              tabActive === 'INFO' || !tabActive ? 'border-green-500 text-green-500' : 'border-slate-200',
              'border-b-2 text-sm font-semibold p-2 duration-500'
            )}>Asset Info</Link>
            <Link href={`?tab=PRESALE`} className={cn(
              tabActive === 'PRESALE' ? 'border-green-500 text-green-500' : 'border-slate-200',
              'border-b-2 text-sm font-semibold p-2 duration-500'
            )}>Presale</Link>
          </div>
          {
            (!tabActive || tabActive === "INFO") && (
              <>
                <div className="mt-2 bg-white border dark:bg-primary-foreground/50 p-4 rounded-lg">
                  <div className="flex flex-col md:flex-row justify-between mb-2 ">
                    <h2 className="text-lg font-semibold">Project Info</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 px-3">
                      <ReviewLog data={data.reviewLogs} />
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-2">
                    <div className="flex flex-col md:flex-row gap-2 items-center">
                      <div className="h-32 w-32 rounded-xl overflow-hidden">
                        <Image
                          className="w-full h-full object-contain"
                          width={100}
                          height={100}
                          src={toUrlAsset(data.logo)}
                          alt={data?.logo}
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex">
                          <div className="w-32">Name</div>
                          <div className="w-3 shrink-0">:</div>
                          <div className="flex-1">{data.name}</div>
                        </div>
                        <div className="flex">
                          <div className="w-32">Ticker</div>
                          <div className="w-3 shrink-0">:</div>
                          <div className="flex-1">{data.ticker}</div>
                        </div>
                        <div className="flex">
                          <div className="w-32">Social</div>
                          <div className="w-3">:</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              {data.socials.map((social, index) => (
                                <Link
                                  key={index}
                                  href={social.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Icon name={social.social.icon} />
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex">
                          <div className="w-32">Chain</div>
                          <div className="w-3">:</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              {data.chains.map((chain, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2"
                                >
                                  <Image
                                    className="w-7 h-7 border rounded-full object-contain"
                                    width={30}
                                    height={30}
                                    src={toUrlAsset(chain.chain.logo)}
                                    alt={chain.chain.logo}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex">
                        <div className="w-32">Owner Name</div>
                        <div className="w-3 shrink-0">:</div>
                        <div className="flex-1 text-sm break-all">
                          {data.user.fullname}
                        </div>
                      </div>
                      <div className="flex">
                        <div className="w-32">Wallet Address</div>
                        <div className="w-3 shrink-0">:</div>
                        <div className="flex-1 text-sm break-all">
                          {data.user.walletAddress ?? "-"}
                        </div>
                      </div>
                      <div className="flex">
                        <div className="w-32">Status</div>
                        <div className="w-3 shrink-0">:</div>
                        <div className="flex-1 text-sm">
                          {data.user.verifications.shift()?.status ??
                            "Not Verified"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="my-2 pt-4">
                    <RowItem
                      labelWidth="w-1/3"
                      label="Total Supply"
                      value={NumberComma(+data.totalSupply)}
                    />
                    <RowItem
                      labelWidth="w-1/3"
                      label="Status"
                      value={<BadgeProjectStatus status={data.status} />}
                    />
                    <RowItem
                      labelWidth="w-1/3"
                      label="Category"
                      value={data.category.name}
                    />
                    <RowItem
                      labelWidth="w-1/3"
                      label="Project Type"
                      value={data.projectType?.name}
                    />
                    <div className="flex py-2 border-t">
                      <div className="w-1/3">Asset Contract</div>
                      <div className="w-3 shrink-0">:</div>
                      <div className="flex-1 text-sm break-all">
                        <a
                          className="text-sm font-semibold underline text-blue-500 block break-all"
                          href={`${data.chains[0].chain.urlScanner}/address/${data.contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {data.contractAddress}
                        </a>
                      </div>
                    </div>
                    <div className="flex py-2 border-t">
                      <div className="w-1/3">Deployer</div>
                      <div className="w-3 shrink-0">:</div>
                      <div className="flex-1 text-sm break-all">
                        <a
                          className="text-sm font-semibold underline text-blue-500 block break-all"
                          href={`${data.chains[0].chain.urlScanner}/address/${data.user.walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {data.user?.walletAddress}
                        </a>
                      </div>
                    </div>
                    <div className="flex py-2 border-t items-center">
                      <div className="w-1/3">Asset Status</div>
                      <div className="w-3 shrink-0">:</div>
                      <SetPauseAsset data={data} />
                    </div>
                    <div className="flex py-2 border-t items-center">
                      <div className="w-1/3">Payment Status</div>
                      <div className="w-3 shrink-0">:</div>
                      <SetPaymentProject data={data} addressPool={addressPool} />
                    </div>
                  </div>
                </div>
                <div className="mt-6 bg-white border dark:bg-primary-foreground/50 p-4 rounded-lg">
                  <div className="grid gap-3 lg:grid-cols-1 items-center">
                    <Allocations
                      data={data.allocations}
                      totalSupply={data.totalSupply}
                      contract={`${data.chains[0].chain.urlScanner}/address/`}
                    />
                  </div>
                  <div className="max-w-xs mx-auto">
                    <ChartAllocations data={data.allocations} />
                  </div>
                </div>
                <div className="mt-6 bg-white border dark:bg-primary-foreground/50 p-4 rounded-lg">
                  <TokenSats data={data} />
                </div>
              </>
            )
          }
          {
            tabActive === "PRESALE" && (
              <PresaleManagement data={data} />
            )
          }
          {
            (!tabActive || tabActive === "INFO") && (
              <div className="sticky bottom-0 flex justify-center md:justify-end flex-wrap gap-2 py-4 mt-2 backdrop-blur-lg">
                <DeployFactoryToken data={data} />
              </div>
            )
          }
        </div>
      )}
    </>
  );
}
