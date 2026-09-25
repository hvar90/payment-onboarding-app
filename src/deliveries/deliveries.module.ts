import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryEntity } from './infrastructure/persistence/entities/delivery.entity';
import { PostgresDeliveryRepository } from './infrastructure/persistence/adapters/postgres-delivery.repository';
import { IDeliveryRepository } from './domain/delivery.repository.interface';
import { CreateDeliveryUseCase } from './application/use-cases/create-delivery.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryEntity])],
  providers: [
    CreateDeliveryUseCase,
    {
      provide: IDeliveryRepository,
      useClass: PostgresDeliveryRepository,
    },
  ],
  exports: [CreateDeliveryUseCase, IDeliveryRepository],
})
export class DeliveriesModule {}