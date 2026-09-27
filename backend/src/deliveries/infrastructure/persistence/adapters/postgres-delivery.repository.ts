import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IDeliveryRepository } from '../../../domain/delivery.repository.interface';
import { DeliveryModel } from '../../../domain/delivery.model';
import { DeliveryEntity } from '../entities/delivery.entity';
import { DeliveryMapper } from '../mappers/delivery.mapper';

@Injectable()
export class PostgresDeliveryRepository implements IDeliveryRepository {
  constructor(
    @InjectRepository(DeliveryEntity)
    private readonly repository: Repository<DeliveryEntity>,
  ) {}

  async save(delivery: DeliveryModel): Promise<DeliveryModel> {
    const persistenceEntity = DeliveryMapper.toPersistence(delivery);
    const savedEntity = await this.repository.save(persistenceEntity);
    return DeliveryMapper.toDomain(savedEntity)!;
  }

  async findById(id: string): Promise<DeliveryModel | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    return DeliveryMapper.toDomain(entity);
  }

  async findByTransactionId(transactionId: string): Promise<DeliveryModel | null> {
    const entity = await this.repository.findOne({ where: { transactionId } });
    if (!entity) return null;
    return DeliveryMapper.toDomain(entity);
  }
}