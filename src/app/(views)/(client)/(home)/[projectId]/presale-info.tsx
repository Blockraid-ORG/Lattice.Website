"use client";
import TimeCountDown from "@/components/time-count-down";
import { Button } from "@/components/ui/button";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import dayjs from "@/lib/dayjs";
import { NumberComma } from "@/lib/utils";
import { TProject } from "@/types/project";
import Link from "next/link";

export default function PresaleInfo({ data }: { data: TProject }) {
  return (
    <div className="z-20 px-3 md:px-0">
      <div className="relative container bg-white shadow shadow-neutral-100/5 border p-6 dark:bg-neutral-950 rounded-xl my-6">
        <h2 className="text-lg md:text-xl font-semibold">Presale Info</h2>
        <div className="mt-4">
          {data.presales.map((presale, index) => (
            <div
              key={presale.id}
              className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full border-b py-2"
            >
              <div>
                <div>{index + 1}</div>
                <p className="text-sm text-neutral-500">Price</p>
                <div className="flex gap-2 items-center">
                  <h2 className="font-bold">
                    {NumberComma(Number(presale.price))}
                  </h2>
                  <p className="text-xs font-medium">
                    {presale.unit.split("/").pop()}/{data.ticker}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Hardcap</p>
                <h2 className="font-bold">
                  {NumberComma(Number(presale.hardcap))} {presale.unit}
                </h2>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Max Contribution</p>
                <h2 className="font-bold">
                  {NumberComma(Number(presale.maxContribution))}{" "}
                  {presale.unit}
                </h2>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Start Date</p>
                <h2 className="font-bold">
                  {dayjs(presale.startDate).format("YYYY-MM-DD HH:mm")}
                </h2>
                <TimeCountDown date={presale.startDate} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">End Date</p>
                <h2 className="font-bold">
                  {dayjs(presale.endDate).format("YYYY-MM-DD HH:mm")}
                </h2>
                <TimeCountDown date={presale.endDate} />
              </div>
            </div>
          ))}
          <div className="flex justify-end mt-3">
            <Button asChild>
              <Link href={`/usr/presale/${data.id}`}>To Presale Page</Link>
            </Button>
          </div>
        </div>
        <GlowingEffect
          borderWidth={1.5}
          variant="default"
          spread={50}
          glow={true}
          disabled={false}
          proximity={20}
          inactiveZone={0.05}
        />
      </div>
    </div>
  );
}
