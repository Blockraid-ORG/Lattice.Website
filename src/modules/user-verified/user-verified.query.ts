"use client"
import { useQuery } from "@tanstack/react-query";
import userVerifiedService from "./user-verified.service";
import { useSearchParams } from "next/navigation";
import { toObjectQuery } from "@/lib/param";


export const useUserVerified = () => {
  const searchString = useSearchParams();
  const query = {
    ...toObjectQuery(searchString),
    noPaginate: 1,
  }
  return useQuery({
    queryKey: ["get_verified_user", query],
    queryFn: () => userVerifiedService.GET_VERIFIED_USER(query),
    enabled: true
  });
}