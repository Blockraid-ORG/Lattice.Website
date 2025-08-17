import { BaseService } from "@/services/base.service"
import { TFormUpdateWhitelist } from "@/types/deploy"
import { TPresale } from "@/types/project"

class TansactionPresaleService extends BaseService<TPresale, TFormUpdateWhitelist> {
  protected endpoint = 'transaction-presale'
}

const TansactionpresaleService = new TansactionPresaleService()
export default TansactionpresaleService
