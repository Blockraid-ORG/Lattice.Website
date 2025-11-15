"use client"
import { toObjectQuery } from "@/lib/param";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import socialService from "./chain.service";


export const useSocial = () => {
  const searchString = useSearchParams();
  const query = toObjectQuery(searchString)
  const queryChain = useQuery({
    queryKey: ["get_social", query],
    queryFn: () => socialService.GET(query),
    enabled: true
  });
  return queryChain
}

export const useSocialList = () => {
  const queryChain = useQuery({
    queryKey: ["get_social_list"],
    queryFn: () => socialService.LISTS(),
    enabled: true
  });
  return queryChain
}
export const useSocialName = (name: string) => {
  const queryChain = useQuery({
    queryKey: ["get_social_name", name],
    queryFn: () => socialService.GetByName(name),
    enabled: true
  });
  return queryChain
}