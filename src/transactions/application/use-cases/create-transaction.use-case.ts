import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresTransactionRepository } from '../../infrastructure/persistence/adapters/postgres-transaction.repository';
import { ApiAdapter } from '../../infrastructure/gateways/api.adapter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductEntity } from '../../../products/infrastructure/persistence/entities/product.entity';
import { CustomerEntity } from '../../../customers/infrastructure/persistence/entities/customer.entity';
import { DeliveryEntity } from '../../../deliveries/infrastructure/persistence/entities/delivery.entity'; // 👈 Ajusta la ruta a tu entidad de delivery

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
    customerData: { fullName: string; email: string };
    cardData: { token: string; installments: number };
    deliveryData: { address: string; city: string }; // 👈 Añadido el DTO de envío requerido
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let product: ProductEntity;
    let totalAmount: number;
    let reference: string;
    let customer: CustomerEntity | null;
    let savedTransaction: any;

    try {
      // 1. Buscamos el producto bloqueando la fila con FOR UPDATE para evitar condiciones de carrera
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

      // 2. Buscamos si ya existe un cliente con ese email o lo creamos
      customer = await queryRunner.manager.findOne(CustomerEntity, {
        where: { email: dto.customerData.email },
      });

      if (!customer) {
        customer = queryRunner.manager.create(CustomerEntity, {
          name: dto.customerData.fullName,
          email: dto.customerData.email,
        });
        customer = await queryRunner.manager.save(customer);
      }

      // 3. Creamos la transacción inicial en estado PENDING vinculando el customerId
      const transaction = queryRunner.manager.create('TransactionEntity', {
        reference,
        status: 'PENDING',
        amount: totalAmount,
        productId: product.id,
        customerId: customer.id,
      });
      savedTransaction = await queryRunner.manager.save('TransactionEntity', transaction);

      // 4. Creamos el registro de Delivery asociado a la transacción y en estado inicial
      const delivery = queryRunner.manager.create(DeliveryEntity, {
        transactionId: savedTransaction.id,
        address: dto.deliveryData.address,
        city: dto.deliveryData.city,
        status: 'PENDING', // O 'PREPARING' según lo manejes inicialmente
      });
      await queryRunner.manager.save(DeliveryEntity, delivery);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    // 5. Llamada externa a la pasarela de pagos (fuera del bloqueo de BD)
    let apiResponse;
    try {
      apiResponse = await this.apiAdapter.charge({
        amountInCents: totalAmount * 100,
        currency: 'COP',
        customerEmail: dto.customerData.email,
        paymentMethod: {
          type: 'CARD',
          installments: dto.cardData.installments || 1,
          token: dto.cardData.token || 'tok_test_123',
        },
        reference,
      });
    } catch {
      apiResponse = { status: 'DECLINED', id: null };
    }

    const finalStatus = apiResponse.status === 'APPROVED' ? 'APPROVED' : 'DECLINED';

    // 6. Actualizamos el estado final de la transacción y el stock de forma segura si se aprueba
    await this.transactionRepository.updateStatus(reference, finalStatus, apiResponse.id);

    if (finalStatus === 'APPROVED') {
      // Descontar stock del producto
      await this.productRepository
        .createQueryBuilder()
        .update(ProductEntity)
        .set({ stock: () => 'stock - 1' })
        .where('id = :id AND stock > 0', { id: product.id })
        .execute();


      // Actualizar estado del delivery a SUCCESS
      await this.dataSource.manager.update(
        DeliveryEntity,
        { transactionId: savedTransaction.id },
        { status: 'SUCCESS' },
      );
    }

    return {
      reference,
      status: finalStatus,
      totalAmount,
      gatewayId: apiResponse.id,
    };
  }
}