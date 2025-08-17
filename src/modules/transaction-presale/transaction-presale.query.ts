import { TFormContribuePresale } from "@/types/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import tansactionpresaleService from "./transaction-presale.service";
import { useSearchParams } from "next/navigation";
import { toObjectQuery } from "@/lib/param";

export const useCreateContribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TFormContribuePresale) => tansactionpresaleService.CREATE(data),
    onSuccess: () => {
      toast.success('Success', {
        description: "Success submit project, waiting for review team!"
      })
      queryClient.invalidateQueries({
        queryKey: ["get_project"]
      });
    },
    onError: () => {
      toast.error('Error', {
        description: "Fail to submit data!"
      })
    }
  });
};
export const useUpcomingPresale = (filters?: { status?: string }) => {
  const searchString = useSearchParams();
  const query = {
    ...toObjectQuery(searchString),
    ...(filters?.status && { status: filters.status })
  }
  return useQuery({
    queryKey: ["get_upcoming_presale", query],
    queryFn: () => tansactionpresaleService.GET_UPCOMING(query),
    enabled: true
  });
}
export const useActivePresale = (filters?: { status?: string }) => {
  const searchString = useSearchParams();
  const query = {
    ...toObjectQuery(searchString),
    ...(filters?.status && { status: filters.status })
  }
  return useQuery({
    queryKey: ["get_active_presale", query],
    queryFn: () => tansactionpresaleService.GET_ACTIVE(query),
    enabled: true
  });
}