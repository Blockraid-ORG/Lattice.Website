"use client"
import { TFormUpdateWhitelist } from "@/types/deploy";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import presaleService from "./presale.service";
import { useSearchParams } from "next/navigation";
import { toObjectQuery } from "@/lib/param";

export const usePresaleDeployed = () => {
  const searchString = useSearchParams();
  const query = toObjectQuery(searchString)
  const queryChain = useQuery({
    queryKey: ["get_presale_dep", query],
    queryFn: () => presaleService.GET_PRESALE(query),
    enabled: true
  });
  return queryChain
}

export const useUpdatePresaleWhitelist = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TFormUpdateWhitelist) => presaleService.UPDATE_PRESALE_WHITELIST(data),
    onSuccess: () => {
      toast.success('Success', {
        description: "Success submit whitelist!"
      })
      queryClient.invalidateQueries({
        queryKey: ["get_project_by_id", id]
      });
    },
    onError: () => {
      toast.error('Error', {
        description: "Fail to submit data"
      })
    }
  });
};