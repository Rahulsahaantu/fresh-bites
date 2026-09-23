declare module 'sslcommerz-lts' {
  class SSLCommerzPayment {
    constructor(store_id: string, store_passwd: string, is_live: boolean);
    init(data: Record<string, unknown>): Promise<Record<string, unknown>>;
    validate(data: Record<string, unknown>): Promise<Record<string, unknown>>;
    orderValidate(data: Record<string, unknown>): Promise<Record<string, unknown>>;
    transactionQueryBySessionId(sessionkey: string): Promise<Record<string, unknown>>;
    transactionQueryByTransactionId(tranId: string): Promise<Record<string, unknown>>;
    refundTransaction(data: Record<string, unknown>): Promise<Record<string, unknown>>;
    refundQuery(refundRefId: string): Promise<Record<string, unknown>>;
  }
  export default SSLCommerzPayment;
}
