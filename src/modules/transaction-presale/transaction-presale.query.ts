import { TFormClaimPresale, TFormContribuePresale } from "@/types/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import tansactionpresaleService from "./transaction-presale.service";
import { useSearchParams } from "next/navigation";
import { toObjectQuery } from "@/lib/param";

export const useCreateContribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TFormContribuePresale) =>
      tansactionpresaleService.CREATE(data),
    onSuccess: () => {
      toast.success("Success", {
        description: `Your contribution success`,
        action: {
          label: "View Transaction",
          onClick: () => {
            window.location.href = ``;
          },
        },
      });
      queryClient.invalidateQueries({
        queryKey: ["get_my_contribution"],
      });
    },
    onError: () => {
      toast.error("Error", {
        description: "Fail to submit data!",
      });
    },
  });
};
export const useUpcomingPresale = (filters?: { status?: string }) => {
  const searchString = useSearchParams();
  const query = {
    ...toObjectQuery(searchString),
    ...(filters?.status && { status: filters.status }),
  };
  return useQuery({
    queryKey: ["get_upcoming_presale", query],
    queryFn: () => tansactionpresaleService.GET_UPCOMING(query),
    enabled: true,
  });
};
export const useActivePresale = (filters?: { status?: string }) => {
  const searchString = useSearchParams();
  const query = {
    ...toObjectQuery(searchString),
    ...(filters?.status && { status: filters.status }),
  };
  return useQuery({
    queryKey: ["get_active_presale", query],
    queryFn: () => tansactionpresaleService.GET_ACTIVE(query),
    enabled: true,
  });
};
export const useMyContribution = (projectId?: string, presaleId?: string) => {
  return useQuery({
    queryKey: ["get_my_contribution", projectId, presaleId],
    queryFn: async ({ queryKey }) => {
      const [, projectId, presaleId] = queryKey;
      if (!projectId || !presaleId) throw new Error("Missing params");
      return await tansactionpresaleService.GET_MY_CONTRIBUTION({
        projectId,
        presaleId,
      });
    },
    enabled: true,
  });
};

export const useCreateClaimedPresale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TFormClaimPresale) =>
      tansactionpresaleService.CREATE_CLAIM_PRESALE(data),
    onSuccess: () => {
      toast.success("Success", {
        description: `Your claim success`,
        action: {
          label: "View Transaction",
          onClick: () => {
            window.location.href = ``;
          },
        },
      });
      queryClient.invalidateQueries({
        queryKey: ["get_my_claimed_presale"],
      });
    },
    onError: () => {
      toast.error("Error", {
        description: "Fail to submit data!",
      });
    },
  });
};
export const useMyClaimedPresale = (filters?: { status?: string }) => {
  const searchString = useSearchParams();
  const query = {
    ...toObjectQuery(searchString),
    ...(filters?.status && { status: filters.status }),
  };
  return useQuery({
    queryKey: ["get_my_claimed_presale", query],
    queryFn: () => tansactionpresaleService.GET_CLAIM_PRESALE(query),
    enabled: true,
  });
};
