"use client"
import { toObjectQuery } from "@/lib/param";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import clientProjectService from "./client-project.service";

export const useClientProject = (filters?: { status?: string }) => {
  const searchString = useSearchParams();
  const query = {
    ...toObjectQuery(searchString),
    ...(filters?.status && { status: filters.status })
  }
  return useQuery({
    queryKey: ["get_project", query],
    queryFn: () => clientProjectService.GET_ALL(query),
    enabled: true
  });
}

export const useClientMyVesting = () => {
  return useQuery({
    queryKey: ["get_my_vesting"],
    queryFn: () => clientProjectService.GetMyVesting(),
    enabled: true
  });
}