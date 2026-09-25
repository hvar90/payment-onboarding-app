import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('deliveries')
export class DeliveryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transactionId: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column({ default: 'PREPARING' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}