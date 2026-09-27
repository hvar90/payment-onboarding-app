import { CustomerMapper } from './customer.mapper';
import { CustomerEntity } from '../entities/customer.entity';
import { CustomerModel } from '../../../domain/customer.model';

describe('CustomerMapper', () => {
  it('should map CustomerEntity to Customer domain model', () => {
    const entity = new CustomerEntity();
    entity.id = 'cust-1';
    entity.email = 'user@test.com';
    entity.name = 'John Doe';
    entity.phone = '3001234567';
    entity.createdAt = new Date();

    const domain = CustomerMapper.toDomain(entity);
    expect(domain).toBeInstanceOf(CustomerModel);
    expect(domain?.id).toEqual('cust-1');
    expect(domain?.email).toEqual('user@test.com');
  });

  it('should map Customer domain model to CustomerEntity', () => {
    const domain = new CustomerModel('cust-1', 'John Doe', 'user@test.com', '3001234567', new Date());
    const entity = CustomerMapper.toPersistence(domain);

    expect(entity).toBeInstanceOf(CustomerEntity);
    expect(entity.email).toEqual('user@test.com');
  });
});