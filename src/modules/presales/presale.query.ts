"use client"
import { TFormUpdateWhitelist } from "@/types/deploy";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import presaleService from "./presale.service";


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
        description: "Fail to submit data!"
      })
    }
  });
};