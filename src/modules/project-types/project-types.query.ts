"use client"
import { toObjectQuery } from "@/lib/param";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import projectTypeService from "./project-types.service";


export const useProjectType = () => {
  const searchString = useSearchParams();
  const query = toObjectQuery(searchString)
  const queryChain = useQuery({
    queryKey: ["get_project_type", query],
    queryFn: () => projectTypeService.GET(query),
    enabled: true
  });
  return queryChain
}

export const useProjectTypeList = () => {
  return useQuery({
    queryKey: ["get_project_type_list"],
    queryFn: () => projectTypeService.LISTS(),
    enabled: true
  });
}
