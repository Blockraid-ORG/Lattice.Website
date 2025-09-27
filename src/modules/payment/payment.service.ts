import { BaseService } from "@/services/base.service"
import { TMasterPayment } from "@/types/payment"

class MasterPaymentService extends BaseService<TMasterPayment> {
  protected endpoint = 'address-pool-payments'
}

const masterPaymentService = new MasterPaymentService()
export default masterPaymentService
