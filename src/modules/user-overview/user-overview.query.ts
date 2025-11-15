"use client"
import { useQuery } from "@tanstack/react-query";
import userOverviewService from "./user-overview.service";


export const useCountAsset = () => {
  return useQuery({
    queryKey: ["user_overview_count_asset"],
    queryFn: () => userOverviewService.GetCountAsset(),
    enabled: true
  });
}
export const useListAsset = () => {
  return useQuery({
    queryKey: ["user_overview_list_asset"],
    queryFn: () => userOverviewService.GetListAsset(),
    enabled: true
  });
}