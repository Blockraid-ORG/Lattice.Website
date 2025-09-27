"use client"

import { useQuery } from "@tanstack/react-query";
import service from "./payment.service";
export const useAddressPoolPayment = () => {
  return useQuery({
    queryKey: ["get_address_pool_payments"],
    queryFn: () => service.GET_ALL(),
    enabled: true
  });
}