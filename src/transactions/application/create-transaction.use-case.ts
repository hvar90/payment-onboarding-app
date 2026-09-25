import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresTransactionRepository } from '../infrastructure/adapters/postgres-transaction.repository';
import { ApiAdapter } from '../infrastructure/adapters/api.adapter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../products/infrastructure/persistence/entities/product.entity';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    private readonly transactionRepository: PostgresTransactionRepository,
    private readonly apiAdapter: ApiAdapter,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async execute(dto: {
    productId: string;
    customerData: any;
    cardData: any;
  }) {
    const product = await this.productRepository.findOne({ where: { id: dto.productId } });
    if (!product || product.stock <= 0) {
      throw new NotFoundException('Product not found or out of stock');
    }

    const baseFee = 2000;
    const deliveryFee = 5000;
    const totalAmount = Number(product.price) + baseFee + deliveryFee;
    const reference = `TX-${Date.now()}`;

    const savedTransaction = await this.transactionRepository.save({
      reference,
      status: 'PENDING',
      amount: totalAmount,
      productId: product.id,
      customerData: dto.customerData,
    });

    const apiResponse = await this.apiAdapter.charge({
      amountInCents: totalAmount * 100,
      currency: 'COP',
      customerEmail: dto.customerData.email,
      paymentMethod: {
        type: 'CARD',
        installments: 1,
        token: dto.cardData.token || 'tok_test_123',
      },
      reference,
    });

    const finalStatus = apiResponse.status === 'APPROVED' ? 'APPROVED' : 'DECLINED';
    await this.transactionRepository.updateStatus(reference, finalStatus, apiResponse.id);

    if (finalStatus === 'APPROVED') {
      product.stock -= 1;
      await this.productRepository.save(product);
    }

    return {
      reference,
      status: finalStatus,
      totalAmount,
      gatewayId: apiResponse.id,
    };
  }
}