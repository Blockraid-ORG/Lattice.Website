import axiosInstance from "@/lib/axios";
const apiKey = process.env.ZKME_API_KEY;
const appId = process.env.ZKME_APP_ID;
const programNo = process.env.ZKME_PROGRAM_NO;

class ZkMeService {
  async GET_TOKEN() {
    const url = "https://nest-api.zk.me/api/token/get";
    const body = {
      apiKey: apiKey!,
      appId: appId!,
      apiModePermission: 0,
      lv: 1,
    };
    const response = await axiosInstance({
      method: "POST",
      url: url,
      data: body,
    });
    return response.data.data.accessToken;
  }

  async GET_USER_INFO({
    walletAddress,
    chainId,
  }: {
    walletAddress: string;
    chainId: string;
  }) {
    const url = "https://agw.zk.me/zkseradmin/openapi/queryKycInfoByAddress";
    const body = {
      mchNo: appId!,
      apiKey: apiKey!,
      programNo: programNo,
      account: walletAddress,
      chainId: chainId,
    };
    const response = await axiosInstance({
      method: "POST",
      url: url,
      data: body,
    });
    return response.data.data;
  }
}

const zkmeService = new ZkMeService();
export default zkmeService;
