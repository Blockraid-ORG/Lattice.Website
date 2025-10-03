import { Icon } from "@/components/icon";
import TimeCountDown from "@/components/time-count-down";
import { Button } from "@/components/ui/button";
import { TProject } from "@/types/project";
import dayjs from "dayjs";
import { Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function PresaleManagement({ data }: { data: TProject }) {
  // const unit = data && data.chains[0].chain.ticker;
  const now = dayjs();
  return (
    <div>
      <div className="my-3 flex justify-between items-center flex-wrap gap-2">
        <h2 className="font-semibold">Presale Management</h2>
        <Button size={"lg"} asChild>
          <Link href={`/usr/my-project/${data.id}/presales`}>
            <Settings /> Manage Presale
          </Link>
        </Button>
      </div>
      <div className="mt-2">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.presales.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow dark:border dark:bg-slate-900/10 p-4 rounded-xl"
            >
              <div className="min-h-12 relative flex items-center justify-center font-bold bg-slate-200 dark:bg-slate-900 rounded-md mb-2 overflow-hidden">
                <div className="absolute left-0 right-0 top-0 bottom-0 z-0">
                  <Image
                    src={data.banner}
                    alt="banner"
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative py-4 z-10 backdrop-blur-lg h-full bg-white/10 w-full">
                  {dayjs(now).isBefore(item.startDate) ? (
                    <div className="flex flex-col justify-center gap-1 items-center">
                      Start In:
                      <TimeCountDown date={item.startDate} />
                    </div>
                  ) : dayjs(now).isAfter(item.startDate) &&
                    dayjs(now).isBefore(item.endDate) ? (
                    <div className="flex flex-col justify-center gap-1 items-center">
                      End In:
                      <TimeCountDown date={item.endDate} />
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center gap-1 items-center">
                      Ended:
                      <div className="flex gap-1 items-center">
                        <ItemCount data={"00"} />
                        <ItemCount data={"00"} />
                        <ItemCount data={"00"} />
                        <ItemCount data={"00"} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1 mb-2">
                <PresaleItem
                  label="Presale ID"
                  value={`${item.presaleSCID ?? "-"}`}
                />
                <PresaleItem
                  label="Hardcap"
                  value={`${item.hardcap} ${item.unit}`}
                />
                <PresaleItem label="Price" value={`${item.price} ${item.unit}`} />
                <PresaleItem
                  label="Max Contribution"
                  value={`${item.maxContribution} ${item.unit}`}
                />
              </div>
              <div className="py-2 space-y-1">
                <PresaleItem
                  label="Start Date"
                  value={dayjs(item.startDate).format("YYYY-MM-DD HH:mm")}
                />
                <PresaleItem
                  label="End Date"
                  value={dayjs(item.endDate).format("YYYY-MM-DD HH:mm")}
                />
                <PresaleItem
                  label="Whitelist Duration"
                  value={`${
                    item.whitelistDuration ? item.whitelistDuration : "-"
                  } hours`}
                />
                <PresaleItem
                  label="Status"
                  value={<PresaleIsActive isActive={item.isActive} />}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PresaleItem = ({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) => {
  return (
    <div className="flex justify-between text-sm">
      <div>{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
};

const PresaleIsActive = ({ isActive }: { isActive?: boolean }) => {
  return (
    <div>
      {isActive ? (
        <div className="flex items-center gap-1">
          <Icon className="text-green-500" name="solar:play-bold" />
          <p>Active</p>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Icon className="text-red-500" name="material-symbols:stop-rounded" />
          <p>Inactive</p>
        </div>
      )}
    </div>
  );
};

const ItemCount = (props: { data: number | string }) => {
  return (
    <div className="text-sm font-bold h-7 w-7 font-mono rounded bg-foreground text-primary-foreground flex items-center justify-center">
      {props.data}
    </div>
  );
};
