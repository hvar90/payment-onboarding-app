import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { TransactionEntity } from '../../../../transactions/infrastructure/persistence/entities/transaction.entity';

@Entity('deliveries')
export class DeliveryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transaction_id', type: 'uuid' })
  transactionId: string;

  @OneToOne(() => TransactionEntity, (transaction) => transaction.delivery)
  @JoinColumn({ name: 'transaction_id' })
  transaction: TransactionEntity;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column({ default: 'PREPARING' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}