"use client";
import { Icon } from "@/components/icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NumberComma, toUrlAsset } from "@/lib/utils";
import { useDeployToken } from "@/modules/deploy/deploy.hook";
import { usePaymentStableChain } from "@/modules/payment-method/payment-method.query";
import { useStateModal } from "@/store/useStateModal";

import { useVestingStore } from "@/store/useVestingStore";
import { TProject } from "@/types/project";
import { BrowserProvider, ethers } from "ethers";
import Image from "next/image";
import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";

export function DeployFactoryToken({ data }: { data: TProject }) {
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const { deployFactoryBasic } = useDeployToken();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setData: setDataVesting } = useVestingStore();
  const { open, setOpen } = useStateModal();
  const chainId = data.chains[0].chain.id;

  const { data: addressPool } = usePaymentStableChain({
    chainId: chainId || "",
    group: "unit",
  });

  // Validasi chains data
  if (!data.chains || data.chains.length === 0 || !chainId) {
    return null;
  }

  function handleChangeOpen() {
    setOpen(!open);
    setDataVesting(data.allocations);
  }

  async function handleDeployContract() {
    setIsSubmitting(true);
    if (typeof window === "undefined") return;
    if (!walletClient || !address) throw new Error("Wallet not connected");
    const provider = new BrowserProvider(walletClient as any);
    const signer = await provider.getSigner(address);
    const message = JSON.stringify({
      name: data.name,
      symbol: data.ticker,
      initialSupply: +data.totalSupply,
      decimals: data.decimals,
      rpc: data.chains[0].chain.urlRpc,
    });

    const bytes = ethers.toUtf8Bytes(message);
    const hexMessage = ethers.hexlify(bytes);

    const sig = await signer.signMessage(hexMessage);
    const addr = await signer.getAddress();

    const responseSign = {
      signer: addr,
      message,
      signature: sig,
    };

    deployFactoryBasic(data, addressPool!, responseSign)
      .then(() => setOpen(false))
      .finally(() => setIsSubmitting(false));
  }

  return (
    <Dialog open={open} onOpenChange={handleChangeOpen}>
      <DialogTrigger asChild>
        {data.status === "APPROVED" ? (
          <Button size={"lg"} className="w-48">
            Deploy
          </Button>
        ) : (
          <Button disabled size={"lg"} className="w-48 cursor-not-allowed">
            Deploy
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Deploy Token</DialogTitle>
          <DialogDescription>
            Deploying contracts, do not close this window until complete!
          </DialogDescription>
        </DialogHeader>
        <div>
          {data && (
            <div>
              <div className="p-4 border rounded-xl mb-6 relative">
                {isSubmitting && (
                  <div className="absolute top-1 right-2 flex items-start">
                    <p className="text-sm font-semibold">Deploying</p>
                    <Icon
                      className="text-2xl"
                      name="eos-icons:three-dots-loading"
                    />
                  </div>
                )}
                <div className="h-24 w-24 border rounded-lg p-2">
                  <Image
                    className="w-full h-full object-contain"
                    width={100}
                    height={100}
                    src={toUrlAsset(data.logo)}
                    alt={data?.logo}
                  />
                </div>
                <div className="flex text-sm">
                  <div className="w-32">Token Name</div>
                  <div className="w-3 shrink-0">:</div>
                  <div className="flex-1 font-semibold">{data.name}</div>
                </div>
                <div className="flex text-sm">
                  <div className="w-32">Symbol/Ticker</div>
                  <div className="w-3 shrink-0">:</div>
                  <div className="flex-1 font-semibold">{data.ticker}</div>
                </div>
                <div className="flex text-sm">
                  <div className="w-32">Total Supply</div>
                  <div className="w-3 shrink-0">:</div>
                  <div className="flex-1 font-semibold">
                    {NumberComma(+data.totalSupply)}
                  </div>
                </div>
                <div className="flex text-sm">
                  <div className="w-32">Contract</div>
                  <div className="w-3 shrink-0">:</div>
                  <div className="flex-1 font-semibold break-all">
                    <a
                      className="text-xs font-semibold underline text-blue-500 block break-all"
                      href={`${data.chains[0].chain.urlScanner}/address/${data.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {data.contractAddress}
                    </a>
                  </div>
                </div>
                {isSubmitting && (
                  <div className="text-xs mt-2 font-semibold text-orange-400">
                    Deploy Contract is Processing, Please do not close window
                    until complete!
                  </div>
                )}
              </div>
              <div>
                {data.allocations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-dashed text-sm"
                  >
                    <div className="flex-1">
                      <div>
                        {item.name !== "Deployer" ? "Contract" : ""} {item.name}{" "}
                        {`(${item.supply}%)`}
                      </div>
                    </div>
                    <div>
                      {item.contractAddress ? (
                        <Icon
                          className="text-lg text-blue-500"
                          name="lets-icons:check-fill"
                        />
                      ) : (
                        <>
                          {item.isDeploying ? (
                            <Icon
                              className="text-sm animate-spin"
                              name="streamline-ultimate:loading-bold"
                            />
                          ) : (
                            <Icon
                              className="text-lg"
                              name="fluent:circle-hint-24-filled"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Deploy"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center">
                  Confirm Deployment
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="text-center">
                    <Icon className="text-4xl mx-auto" name="typcn:info" />
                    <p>Proceed with deployment? This cannot be undone.</p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeployContract}>
                  {isSubmitting ? "Processing..." : "Yes, Deploy"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
