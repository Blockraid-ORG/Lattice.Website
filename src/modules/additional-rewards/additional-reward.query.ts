"use client"
import { toObjectQuery } from "@/lib/param";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import additionalRewardService from "./additional-reward.service";
import { TFormAdditionalReward } from "@/types/additional-reward";
import { toast } from "sonner";


export const useAdditionalReward = (projectId: string) => {
  const searchString = useSearchParams();
  const query = toObjectQuery(searchString)
  const queryChain = useQuery({
    queryKey: ["get_additional_reward", query],
    queryFn: () => additionalRewardService.GET_ALL({
      ...query,
      projectId,
    }),
    enabled: true
  });
  return queryChain
}
export const useAdditionalRewardList = () => {
  return useQuery({
    queryKey: ["get_additional_reward_list"],
    queryFn: () => additionalRewardService.LISTS(),
    enabled: true
  });
}
export const useCreateAdditionalReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TFormAdditionalReward) => additionalRewardService.CREATE(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_additional_reward"]
      });
      toast.success('Success', {
        description: "Success create data!"
      })
    },
    onError: () => {
      toast.error('Error', {
        description: "Fail to submit data!"
      })
    }
  });
};
export const useUpdateAdditionalReward = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { contractAddress: string }) => additionalRewardService.SET_CONTRACT_ADDRESS({
      id,
      contractAddress: data.contractAddress
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_additional_reward"]
      });
    },
    onError: () => {
      toast.error('Error', {
        description: "Fail to submit data!"
      })
    }
  });
};
export const useSetAllocations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => additionalRewardService.SET_ALLOCATIONS(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_additional_reward"]
      });
      toast.success('Success', {
        description: "Success set data!"
      })
    },
    onError: () => {
      toast.error('Error', {
        description: "Fail to submit data!"
      })
    }
  });
};
export const useRemoveAllocations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => additionalRewardService.REMOVE_ALLOCATIONS(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_additional_reward"]
      });
      toast.success('Success', {
        description: "Success set data!"
      })
    },
    onError: () => {
      toast.error('Error', {
        description: "Fail to submit data!"
      })
    }
  });
};
export const useDetailReward = (id: string) => {
  const queryChain = useQuery({
    queryKey: ["get_additional_reward_id", id],
    queryFn: () => additionalRewardService.DETAIL(id),
    enabled: true
  });
  return queryChain
}
