"use client"
import { TFormVerifyProject, TSetPresale, TSetWhitelist } from "@/types/deploy";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import deployService from "./deploy.service";
import projectService from "../project/project.service";


export const useDeployProject = (id?: string) => {
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
export const useDeployWhitelist = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TSetWhitelist) => projectService.SET_CONTRACT_WHITELIST(data),
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
export const useDeployPresale = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TSetPresale) => projectService.SET_CONTRACT_PRESALE(data),
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