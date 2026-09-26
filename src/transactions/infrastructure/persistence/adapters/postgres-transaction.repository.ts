import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entity';

@Injectable()
export class PostgresTransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async save(transactionData: Partial<TransactionEntity>): Promise<TransactionEntity> {
    const transaction = this.transactionRepository.create(transactionData);
    return await this.transactionRepository.save(transaction);
  }

  async updateStatus(reference: string, status: string, gatewayId: string): Promise<void> {
    await this.transactionRepository.update({ reference }, { status, gatewayTransactionId: gatewayId });
  }
}