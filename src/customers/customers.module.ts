import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from './infrastructure/persistence/entities/customer.entity';
import { PostgresCustomerRepository } from './infrastructure/persistence/adapters/postgres-customer.repository';
import { ICustomerRepository } from './domain/customer.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity])],
  providers: [
    {
      provide: ICustomerRepository,
      useClass: PostgresCustomerRepository,
    },
  ],
  exports: [ICustomerRepository],
})
export class CustomersModule {}