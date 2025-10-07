import { useQuery } from "@tanstack/react-query";
import servicePaymentMethod from './payment-method.service'
export const useStableCoinGroup = () => {
  const queryChain = useQuery({
    queryKey: ["get_payment_method"],
    queryFn: () => servicePaymentMethod.GetStableCoinGroup(),
    enabled: true
  });
  return queryChain
}
export const usePaymentStableChain = (params: { chainId: string, group: string }) => {
  const queryChain = useQuery({
    queryKey: ["get_payment_method"],
    queryFn: () => servicePaymentMethod.GetAddressPoolPaymentByGroupName(params),
    enabled: !!params
  });
  return queryChain
}