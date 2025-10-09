"use client"
import { toObjectQuery } from "@/lib/param";
import { TFormFaucet } from "@/types/faucet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import service from "./faucet.service";

export const useFaucet = () => {
  const searchString = useSearchParams();
  const query = toObjectQuery(searchString)
  const queryChain = useQuery({
    queryKey: ["get_faucet", query],
    queryFn: () => service.Get(query),
    enabled: true
  });
  return queryChain
}

export const useCreateFaucet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TFormFaucet) => service.Create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_faucet"]
      });
    },
    onError: () => {
      toast.error('Error', {
        description: "Fail to claim faucet data"
      })
    }
  });
}
