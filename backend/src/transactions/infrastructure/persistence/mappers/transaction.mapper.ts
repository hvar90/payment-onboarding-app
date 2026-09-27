import { TransactionModel } from '../../../domain/transaction.model';
import { TransactionEntity } from '../entities/transaction.entity';

export class TransactionMapper {
  static toDomain(entity: TransactionEntity): TransactionModel | null {
    if (!entity) return null;
    return new TransactionModel(
      entity.id,
      entity.reference,
      entity.status,
      entity.amount,
      entity.productId,
      entity.gatewayTransactionId,
    );
  }

  static toPersistence(model: TransactionModel): TransactionEntity | null {
    if (!model) return null;
    const entity = new TransactionEntity();
    entity.id = model.id;
    entity.reference = model.reference;
    entity.status = model.status;
    entity.amount = model.amount;
    entity.productId = model.productId;
    entity.gatewayTransactionId = model.gatewayTransactionId ?? '';
    return entity;
  }
}