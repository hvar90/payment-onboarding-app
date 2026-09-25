import { Controller, Post, Body } from '@nestjs/common';
import { CreateTransactionUseCase } from '../../application/create-transaction.use-case';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly createTransactionUseCase: CreateTransactionUseCase) {}

  @Post()
  async create(@Body() body: { productId: string; customerData: any; cardData: any }) {
    return await this.createTransactionUseCase.execute(body);
  }
}