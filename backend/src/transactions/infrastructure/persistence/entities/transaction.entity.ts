import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { DeliveryEntity } from '../../../../deliveries/infrastructure/persistence/entities/delivery.entity'; 

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  reference: string;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: string; // PENDING, APPROVED, DECLINED

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Column({ type: 'uuid', nullable: true, name: 'customer_id' })
  customerId: string; 

  @Column({ type: 'varchar', nullable: true, name: 'gateway_transaction_id' })
  gatewayTransactionId: string;

  @OneToOne(() => DeliveryEntity, (delivery) => delivery.transaction, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transaction_id' }) // Opcional, pero conecta formalmente la FK
  delivery: DeliveryEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}