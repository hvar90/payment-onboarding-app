import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresTransactionRepository } from '../../infrastructure/persistence/adapters/postgres-transaction.repository';
import { ApiAdapter } from '../../infrastructure/gateways/api.adapter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductEntity } from '../../../products/infrastructure/persistence/entities/product.entity';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    private readonly transactionRepository: PostgresTransactionRepository,
    private readonly apiAdapter: ApiAdapter,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: {
    productId: string;
    customerData: any;
    cardData: any;
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let product: ProductEntity;
    let totalAmount: number;
    let reference: string;

    try {
      // 1. Buscamos el producto bloqueando la fila con FOR UPDATE para evitar condiciones de carrera simultáneas
      const foundProduct = await queryRunner.manager.findOne(ProductEntity, {
        where: { id: dto.productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!foundProduct || foundProduct.stock <= 0) {
        throw new NotFoundException('Product not found or out of stock');
      }

      product = foundProduct;

      const baseFee = 2000;
      const deliveryFee = 5000;
      totalAmount = Number(product.price) + baseFee + deliveryFee;
      reference = `TX-${Date.now()}`;

      // 2. Creamos la transacción inicial en estado PENDING dentro de la misma transacción de BD
      await queryRunner.manager.save('TransactionEntity', {
        reference,
        status: 'PENDING',
        amount: totalAmount,
        productId: product.id,
        customerData: dto.customerData,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    // 3. Llamada externa a la pasarela de pagos (fuera del bloqueo de BD)
    let apiResponse;
    try {
      apiResponse = await this.apiAdapter.charge({
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
    } catch {
      apiResponse = { status: 'DECLINED', id: null };
    }

    const finalStatus = apiResponse.status === 'APPROVED' ? 'APPROVED' : 'DECLINED';

    // 4. Actualizamos el estado final y el stock de forma segura
    await this.transactionRepository.updateStatus(reference, finalStatus, apiResponse.id);

    if (finalStatus === 'APPROVED') {
      await this.productRepository
        .createQueryBuilder()
        .update(ProductEntity)
        .set({ stock: () => 'stock - 1' })
        .where('id = :id AND stock > 0', { id: product.id })
        .execute();
    }

    return {
      reference,
      status: finalStatus,
      totalAmount,
      gatewayId: apiResponse.id,
    };
  }
}