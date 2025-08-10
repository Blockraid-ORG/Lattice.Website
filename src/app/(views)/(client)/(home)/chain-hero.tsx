"use client";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { useChainList } from "@/modules/chain/chain.query";
export function ChainHero() {
  const { data } = useChainList()
  return (
    <div className="flex justify-center md:justify-end mb-4 md:mb-10 w-full">
      {
        data && <AnimatedTooltip items={data.map((i, index) => {
          return {
            id: index,
            name: i.label!,
            designation: i.ticker!,
            image: i.logo!,
          }
        })} />
      }
    </div>
  );
}
