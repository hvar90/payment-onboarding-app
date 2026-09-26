export class DeliveryModel {
  constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public readonly address: string,
    public readonly city: string,
    public readonly status: string,
    public readonly createdAt: Date,
  ) {}
}