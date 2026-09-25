import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICustomerRepository } from '../../../domain/customer.repository.interface';
import { CustomerModel } from '../../../domain/customer.model';
import { CustomerEntity } from '../entities/customer.entity';
import { CustomerMapper } from '../mappers/customer.mapper';

@Injectable()
export class PostgresCustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly repository: Repository<CustomerEntity>,
  ) {}

  async findById(id: string): Promise<CustomerModel | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    return CustomerMapper.toDomain(entity);
  }

  async findByEmail(email: string): Promise<CustomerModel | null> {
    const entity = await this.repository.findOne({ where: { email } });
    if (!entity) return null;
    return CustomerMapper.toDomain(entity);
  }

  async save(customer: CustomerModel): Promise<CustomerModel> {
    const persistenceEntity = CustomerMapper.toPersistence(customer);
    const savedEntity = await this.repository.save(persistenceEntity);
    return CustomerMapper.toDomain(savedEntity)!;
  }
}