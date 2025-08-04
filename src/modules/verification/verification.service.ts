import axiosInstance from "@/lib/axios";
import { BaseService } from "@/services/base.service";
import { TFormMemberVerification, TProfileDetail } from "@/types/profile";

class VerificationService extends BaseService<
  TProfileDetail,
  TFormMemberVerification
> {
  protected endpoint = "member-verifications";
  async REVISION(form: TFormMemberVerification) {
    const response = await axiosInstance({
      method: "POST",
      url: this.endpoint + "/revision",
      data: form,
    });
    return response.data.data;
  }
  async APPROVE_BY_WALLET_ADDRESS(walletAddress: string) {
    const response = await axiosInstance({
      method: "POST",
      url: this.endpoint + "/approve-by-zkme",
      data: { walletAddress },
    });
    return response.data.data;
  }
}

const verificationService = new VerificationService();
export default verificationService;
