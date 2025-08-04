"use client";
import PixelIcon from "@/components/pixel-icon";
import { cn } from "@/lib/utils";
import { useMyProfile } from "@/modules/profile/profile.query";
import AlertVerification from "./alert-verification";
import ContentLoading from "./content-loading";
import { FormPopup } from "./form-popup";
import RowItem from "./row-item";
import { VerificationLog } from "./verification-log";

export default function ProfileContent() {
  const { data, isLoading } = useMyProfile();
  return (
    <div>
      <div className="max-w-xl mx-auto mt-12">
        {!isLoading && data ? (
          <>
            <AlertVerification
              status={data.lastVerification}
              walletAddress={data.walletAddress ?? ""}
            />
            <div className="my-6">
              <h2 className="font-semibold mb-1">Account Info</h2>
              <div>
                <RowItem label="Fullname">
                  <div className="flex justify-between items-center">
                    <p>{data?.fullname}</p>
                    {data?.id && (
                      <FormPopup
                        id={data.id}
                        fieldName="fullname"
                        fieldValue={data?.fullname}
                      />
                    )}
                  </div>
                </RowItem>
                <RowItem label="Wallet Address">
                  <div className="flex gap-3 items-center">
                    <div className="border h-6 w-6 rounded-full overflow-hidden bg-white">
                      <PixelIcon
                        username={JSON.stringify(data)}
                        width={30}
                        height={30}
                      />
                    </div>
                    <div>{data?.walletAddress}</div>
                  </div>
                </RowItem>
                <RowItem label="Email">
                  <div className="flex justify-between items-center">
                    <p>{data?.email}</p>
                    {data?.id && (
                      <FormPopup
                        id={data.id}
                        fieldName="email"
                        fieldValue={data?.email}
                      />
                    )}
                  </div>
                </RowItem>
                <RowItem label="Verification Status">
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded",
                      data.lastVerification === "APPROVED" &&
                        "bg-green-200 text-green-600",
                      data.lastVerification === "PENDING" &&
                        "bg-orange-200 text-orange-600",
                      !data.lastVerification ||
                        (data.lastVerification === "REJECTED" &&
                          "bg-red-200 text-red-600")
                    )}
                  >
                    {data.lastVerification ?? "Not Verified!"}
                  </span>
                </RowItem>
                <RowItem label="Category" value={data?.category} />
              </div>
            </div>
            <VerificationLog data={data.verificationLogs} />
          </>
        ) : (
          <>
            <ContentLoading count={7} />
            <div className="border p-4">
              <ContentLoading count={5} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
