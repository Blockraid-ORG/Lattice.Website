"use client";
import { Icon } from "@/components/icon";
import { NumberComma, toUrlAsset } from "@/lib/utils";
import { useActivePresale } from "@/modules/transaction-presale/transaction-presale.query";
import dayjs from "@/lib/dayjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ActivePresale() {
  const { data, isLoading } = useActivePresale();
  return (
    <section className="py-12 md:py-24 bg-[#D8E9FD]/20 dark:bg-[#001123]">
      <div className="container">
        <div className="max-w-xl mb-12">
          <h2 className="text-2xl md:text-4xl font-bold max-w-xl">Active</h2>
          {/* <p>Contribute now to get best price</p> */}
        </div>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-4 gap-2 md:gap-6">
            {data?.data &&
              data?.data?.map((item, index) => (
                <div
                  key={index}
                  className="relative border dark:border-transparent bg-white cursor-pointer dark:bg-[#0A2342] p-2 rounded-xl hover:scale-105 duration-300"
                >
                  <div className="relative">
                    <Link
                      href={item.project.id}
                      className="absolute top-4 right-4 z-20 py-1 px-2 text-white bg-green-400 rounded-full inline-flex gap-2 items-center text-xs font-bold backdrop-blur"
                    >
                      Active
                    </Link>
                    <div className="aspect-video block relative z-10">
                      {item?.project?.banner && (
                        <Image
                          fill
                          alt="aset"
                          className="z-10 rounded-xl object-cover"
                          src={toUrlAsset(item.project.banner)}
                        />
                      )}
                      <div className="absolute -bottom-7 left-7 h-14 w-14 p-1 bg-white z-10 rounded-full overflow-hidden">
                        <Image
                          width={100}
                          height={100}
                          alt="aset"
                          className="w-full h-full object-cover rounded-full"
                          src={
                            toUrlAsset(item.project.logo) ??
                            "/images/dummy-1.png"
                          }
                        />
                      </div>
                    </div>
                    <div className="absolute right-2 bottom-2 z-20">
                      {item.project.chains.map((item, index) => (
                        <Image
                          key={index}
                          width={100}
                          height={100}
                          alt="aset"
                          className="w-6 h-6 object-cover rounded-full"
                          src={`${
                            toUrlAsset(item.chain.logo) ??
                            "/icons/networks/3.png"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="pl-24 flex justify-end gap-1 mt-2">
                      {item.project.socials.map((item, index) => (
                        <BadgeSocial
                          key={index}
                          url={item.url}
                          icon={item?.social?.icon}
                        />
                      ))}
                    </div>
                    <div className="px-3 pb-3 pt-6">
                      <div className="space-y-2">
                        <div className="text-xs font-semibold uppercase">
                          {item.project?.projectType?.name}
                        </div>
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold">
                            {item.project.name}
                          </h2>
                        </div>
                        <p className="text-sm line-clamp-2 w-full break-all">
                          {item.project.detail || "-"}
                        </p>
                      </div>
                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-sm font-semibold">
                          <div>Total Supply:</div>
                          <div>{NumberComma(+item.project.totalSupply)}</div>
                        </div>
                        <div className="flex justify-between text-sm font-semibold">
                          <div>Start:</div>
                          <div>
                            {dayjs(item.startDate).format("YYYY-MM-DD HH:mm")}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm font-semibold">
                          <div>End:</div>
                          <div>
                            {dayjs(item.endDate).format("YYYY-MM-DD HH:mm")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <Button className="w-full" asChild>
                      <Link href={item.project.id}>Project Detail</Link>
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
const BadgeSocial = (props: { icon: string; url: string }) => {
  return (
    <Link
      href={props.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-blue-200 text-blue-700 rounded-md flex items-center gap-1 p-1 text-xs"
    >
      <Icon className="text-lg" name={props.icon} />
    </Link>
  );
};
