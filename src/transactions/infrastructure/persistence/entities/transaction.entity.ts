import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @Column({ type: 'jsonb', nullable: true })
  customerData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    cardNumber: string;
  };

  @Column({ type: 'varchar', nullable: true, name: 'gateway_transaction_id' })
  gatewayTransactionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}