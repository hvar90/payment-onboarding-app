import { Controller, Post, Body } from '@nestjs/common';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly createTransactionUseCase: CreateTransactionUseCase) {}

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return await this.createTransactionUseCase.execute(createTransactionDto);
  }
}