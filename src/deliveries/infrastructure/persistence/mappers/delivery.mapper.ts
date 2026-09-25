import { DeliveryModel } from '../../../domain/delivery.model';
import { DeliveryEntity } from '../entities/delivery.entity';

export class DeliveryMapper {
  static toDomain(entity: DeliveryEntity): DeliveryModel | null {
    if (!entity) return null;
    return new DeliveryModel(
      entity.id,
      entity.transactionId,
      entity.address,
      entity.city,
      entity.status,
      entity.createdAt,
    );
  }

  static toPersistence(model: DeliveryModel): DeliveryEntity {
    const entity = new DeliveryEntity();
    entity.id = model.id;
    entity.transactionId = model.transactionId;
    entity.address = model.address;
    entity.city = model.city;
    entity.status = model.status;
    entity.createdAt = model.createdAt;
    return entity;
  }
}