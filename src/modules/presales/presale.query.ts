"use client"
import { toObjectQuery } from "@/lib/param";
import { TFormUpdateWhitelist } from "@/types/deploy";
import { TFormProjectPresale } from "@/types/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import presaleService from "./presale.service";

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

export const useCreateNewPresale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TFormProjectPresale) => presaleService.CREATE_NEW_PRESALE(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_project_by_id"]
      });
    },
    onError: () => {
      toast.error('Error', {
        description: "Fail to submit data"
      })
    }
  });
}
export const useUpdateNewPresale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }:{id:string, data: TFormProjectPresale}) => presaleService.UPDATE_NEW_PRESALE(id,data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_project_by_id"]
      });
    },
    onError: () => {
      toast.error('Error', {
        description: "Fail to submit data"
      })
    }
  });
}
export const useDeletePresale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => presaleService.DELETE_NEW_PRESALE(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_project_by_id"]
      });
      toast.success('Success', {
        description: "Success delete presale!"
      })
    },
    onError: () => {
      toast.error('Error', {
        description: "Fail to delete data"
      })
    }
  });
}