"use client";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { NumberComma } from "@/lib/utils";
import { TProject } from "@/types/project";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ContentItem({ data }: { data: TProject }) {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div className="rounded-2xl hover:scale-105 duration-200 bg-white dark:bg-white/5 border shadow-md border-slate-300/20 overflow-hidden">
      <Link href={`/${data.id}`}>
        <div className="aspect-[4/3] relative p-2 overflow-hidden rounded-xl">
          {!isLoaded && (
            <Skeleton className="absolute inset-0 flex items-center justify-center bg-neutral-400/20">
              <Icon name="ion:image" className="animate-pulse text-3xl" />
            </Skeleton>
          )}
          <Image
            width={300}
            height={300}
            className="w-full h-full object-cover rounded-lg"
            alt={data.name}
            src={data.banner}
            onLoadingComplete={() => setIsLoaded(true)}
          />
        </div>
        <div className="px-4">
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 shrink-0 relative border rounded-full overflow-hidden">
              <Image
                width={30}
                height={30}
                className="w-full h-full object-cover rounded-lg"
                alt={data.name}
                src={data.logo}
                onLoadingComplete={() => setIsLoaded(true)}
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <h2 className="font-semibold">{data.ticker}</h2>
              <div>-</div>
              <p className="text-sm md:text-base">{data.name}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm mt-3">
            <div className="w-32">Total Supply</div>
            <div className="flex-1 text-end font-semibold">
              {NumberComma(Number(data.totalSupply))}
            </div>
          </div>
          <div className="mt-3">
            <div className="flex gap-1 items-center">
              <Icon name={data.category.icon} />
              <h3 className="text-sm">{data.category.name}</h3>
            </div>
          </div>
        </div>
      </Link>
      <div className="mt-4 p-4">
        <div className="flex justify-end items-center gap-2">
          {data.socials.map((item, index) => (
            <a
              className="border rounded-lg flex w-7 h-7 items-center justify-center"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              key={index}
            >
              <Icon className="text-lg" name={item.social.icon} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
