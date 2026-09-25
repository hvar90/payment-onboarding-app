export class TransactionModel {
  constructor(
    public readonly id: string,
    public readonly reference: string,
    public readonly status: string,
    public readonly amount: number,
    public readonly productId: string,
    public readonly customerData: any,
    public readonly gatewayTransactionId?: string,
  ) {}
}