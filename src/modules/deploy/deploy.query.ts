"use client"
import { TFormVerifyProject } from "@/types/deploy";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import deployService from "./deploy.service";


export const useDeployProject = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TFormVerifyProject) => deployService.DEPLOY(data),
    onSuccess: () => {
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