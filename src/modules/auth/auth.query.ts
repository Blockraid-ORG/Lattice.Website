"use client";
import { TFormSignVanity, TRequestNonce, TVerifySignature } from "@/types/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import Cookies from 'js-cookie';
import authService from "./auth.service";
export const useRequestNonce = () => {
  return useMutation({
    mutationFn: (data: TRequestNonce) => authService.REQUEST_NONCE(data),
  });
};
export const useVerifySignature = () => {
  return useMutation({
    mutationFn: (data: TVerifySignature) => authService.VERIFY_SIGNATURE(data),
    onSuccess: (data) => {
      Cookies.set('token', data.accessToken)
      Cookies.set('refreshtoken', data.refreshToken)
      localStorage.setItem('permissions', JSON.stringify(data.permissions))
      localStorage.setItem('roles', JSON.stringify(data.roles))
      localStorage.setItem('user', JSON.stringify(data.user))
    }
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => authService.LOGOUT(),
    onSuccess: () => {
      Cookies.remove('token')
      Cookies.remove('refreshtoken')
      localStorage.removeItem('permissions')
      localStorage.removeItem('roles')
      localStorage.removeItem('sidemenus')
      localStorage.removeItem('user')
    }
  });
}

export const useCheckAuth = () => {
  const queryChain = useQuery({
    queryKey: ["check_auth"],
    queryFn: () => {
      const token = Cookies.get('token')
      return !!token
    },
    enabled: true
  });
  return queryChain
}

export const useSignVanity = () => {
  return useMutation({
    mutationFn: (data: TFormSignVanity) => authService.SIGN_VANITY(data),
  });
};

