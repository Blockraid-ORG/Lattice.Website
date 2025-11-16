"use client";

import { NumberComma } from "@/lib/utils";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { TResponsePresale } from "@/types/project";
import { Skeleton } from "@/components/ui/skeleton";
import { useEndedPresale } from "@/modules/transaction-presale/transaction-presale.query";

function OurProject() {
  const { data, isLoading } = useEndedPresale();
  // Menggunakan dummy data untuk preview
  return (
    <section className="py-12 md:py-24 bg-gradient-to-br from-[#D8E9FD]/20 via-[#E8F4FD]/10 to-[#F0F8FF]/20 dark:from-[#001123] dark:via-[#001A2E] dark:to-[#002244]">
      <div className="container">
        <div className="max-w-xl mb-12">
          <h2 className="text-2xl md:text-4xl font-bold max-w-xl">
            Our Project
          </h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.data &&
              data?.data?.map((item, index) => (
                <ContentItem data={item} key={index} />
              ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ContentItem({ data }: { data: TResponsePresale }) {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div className="rounded-2xl hover:scale-105 duration-200 bg-white dark:bg-white/5 border shadow-md border-slate-300/20 overflow-hidden">
      <Link href={`/project-end-presale/${data.project.id}`}>
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
            alt={data.project.name}
            src={data.project.banner}
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
                alt={data.project.name}
                src={data.project.logo}
                onLoadingComplete={() => setIsLoaded(true)}
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <h2 className="font-semibold">{data.project.ticker}</h2>
              <div>-</div>
              <p className="text-sm md:text-base">{data.project.name}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm mt-3">
            <div className="w-32">Total Supply</div>
            <div className="flex-1 text-end font-semibold">
              {NumberComma(Number(data.project.totalSupply))}
            </div>
          </div>
          <div className="mt-3">
            <div className="flex gap-1 items-center">
              <Icon name={data.project.category.icon} />
              <h3 className="text-sm">{data.project.category.name}</h3>
            </div>
          </div>
        </div>
      </Link>
      <div className="mt-4 p-4">
        <div className="flex justify-end items-center gap-2">
          {data.project.socials.map((item, index) => (
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

export default OurProject;
