"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStableCoinGroup } from "@/modules/payment-method/payment-method.query";
import paymentService from "@/modules/payment-method/payment-method.service";
import { useProjectDetail } from "@/modules/project/project.query";
import { TMasterPayment } from "@/types/payment";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSwitchChain } from "wagmi";
import RowItem from "../../../me/row-item";
import { ConfirmPay } from "./confirm-pay";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PaymentContent() {
  const { projectId } = useParams();
  const { data: project } = useProjectDetail(
    Array.isArray(projectId) ? projectId[0] : projectId?.toString() || ""
  );
  const { switchChain } = useSwitchChain();
  const [masterPayments, setMasterPayments] = useState<
    TMasterPayment[] | undefined
  >();
  useEffect(() => {
    if (project && project.chains && project.chains.length > 0) {
      switchChain({
        chainId: project?.chains[0].chain.chainid,
      });
    }
  }, [project, switchChain]);

  const { data: groups } = useStableCoinGroup();
  async function changePaymentGroup(value: string) {
    if (project) {
      const results = await paymentService.GetAddressPoolPayment({
        chainId: project?.chains[0].chain.id,
        stableCoinGroupId: value,
        status: true,
      });
      if (results.length <= 0) {
        toast.warning("Warning!", {
          description: "Payment method is not active!",
        });
      }
      setMasterPayments(results);
    }
  }
  return (
    <div className=" bg-white border dark:bg-primary-foreground/50 p-4 rounded-lg">
      {project && (
        <div>
          <div className="space-y-2">
            <Label>Choose Payment</Label>
            <Select onValueChange={changePaymentGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select the currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {groups &&
                    groups.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {masterPayments ? (
            <div className="mt-4">
              <div className="mb-2">
                <h2 className="text-lg font-semibold">Billing Info</h2>
              </div>
              {masterPayments.length > 0 &&
                masterPayments.map((i) => (
                  <div key={i.id}>
                    <div className="mb-4">
                      <RowItem label="Amount Due">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-semibold">
                            {i.listingFee}
                          </h2>
                          <div>{i.stableCoin.stableCoin.name} </div>
                        </div>
                      </RowItem>
                      <RowItem
                        label={`Address ${i.stableCoin.stableCoin.name}`}
                      >
                        <div className="break-all">{i.stableCoin.address}</div>
                      </RowItem>
                      <RowItem
                        label="Chain"
                        value={`${i.stableCoin.chain.name}`}
                      />
                    </div>
                    <ConfirmPay data={i} project={project} />
                  </div>
                ))}
            </div>
          ) : (
            <div className="mt-4">
              <Alert>
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>
                  Please select a payment method to continue!
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
