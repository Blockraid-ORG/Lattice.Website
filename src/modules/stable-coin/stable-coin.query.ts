import { toObjectQuery } from "@/lib/param";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import stableCoinService from './stable-coin.service'
export const useStableCoinGroupList = () => {
  const searchString = useSearchParams();
  const query = toObjectQuery(searchString)
  const queryChain = useQuery({
    queryKey: ["get_stable_coin_list", query],
    queryFn: () => stableCoinService.LIST_GROUP(),
    enabled: true
  });
  return queryChain
}