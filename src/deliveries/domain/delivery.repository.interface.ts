import { DeliveryModel } from './delivery.model';

export interface IDeliveryRepository {
  save(delivery: DeliveryModel): Promise<DeliveryModel>;
  findById(id: string): Promise<DeliveryModel | null>;
  findByTransactionId(transactionId: string): Promise<DeliveryModel | null>;
}

export const IDeliveryRepository = Symbol('IDeliveryRepository');