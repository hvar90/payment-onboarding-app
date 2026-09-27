import { CustomerModel } from '../../../domain/customer.model';
import { CustomerEntity } from '../entities/customer.entity';

export class CustomerMapper {
  static toDomain(entity: CustomerEntity): CustomerModel | null {
    if (!entity) return null;
    return new CustomerModel(
      entity.id,
      entity.name,
      entity.email,
      entity.createdAt,
    );
  }

  static toPersistence(model: CustomerModel): CustomerEntity {
    const entity = new CustomerEntity();
    entity.id = model.id;
    entity.name = model.name;
    entity.email = model.email;
    entity.createdAt = model.createdAt ?? new Date();
    return entity;
  }
}