"use client";
import { TFormMemberVerification } from "@/types/profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import verificationService from "./verification.service";
import { toast } from "sonner";

export const useCreateMemberVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
    }: {
      data: TFormMemberVerification & { userId: string };
    }) => verificationService.CREATE(data),
    onSuccess: () => {
      toast.success("Success", {
        description: "Success submit data",
      });
      queryClient.invalidateQueries({
        queryKey: ["get_my_profile"],
      });
    },
    onError: () => {
      toast.error("Error", {
        description: "Fail to submit data!",
      });
    },
  });
};
export const useRevisionMemberVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
    }: {
      data: TFormMemberVerification & { userId: string };
    }) => verificationService.REVISION(data),
    onSuccess: () => {
      toast.success("Success", {
        description: "Success revision data",
      });
      queryClient.invalidateQueries({
        queryKey: ["get_my_profile"],
      });
    },
    onError: () => {
      toast.error("Error", {
        description: "Fail to revision data!",
      });
    },
  });
};

export const useApproveByWalletAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ walletAddress }: { walletAddress: string }) =>
      verificationService.APPROVE_BY_WALLET_ADDRESS(walletAddress),
    onSuccess: () => {
      toast.success("Success", {
        description: "Success approve by wallet address",
        position: "top-right",
      });
      queryClient.invalidateQueries({
        queryKey: ["get_my_profile"],
      });
    },
    onError: () => {
      toast.error("Error", {
        description: "Fail to approve by wallet address",
      });
    },
  });
};
