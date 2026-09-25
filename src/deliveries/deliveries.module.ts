import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryEntity } from './infrastructure/persistence/entities/delivery.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryEntity])],
  exports: [],
})
export class DeliveriesModule {}