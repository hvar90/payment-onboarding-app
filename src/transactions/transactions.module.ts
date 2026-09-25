import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './infrastructure/persistence/entities/transaction.entity';
import { ProductEntity } from '../products/infrastructure/persistence/entities/product.entity';
import { TransactionsController } from './infrastructure/controllers/transactions.controller';
import { CreateTransactionUseCase } from './application/create-transaction.use-case';
import { PostgresTransactionRepository } from './infrastructure/adapters/postgres-transaction.repository';
import { ApiAdapter } from './infrastructure/adapters/api.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity, ProductEntity])],
  controllers: [TransactionsController],
  providers: [CreateTransactionUseCase, PostgresTransactionRepository, ApiAdapter],
})
export class TransactionsModule {}