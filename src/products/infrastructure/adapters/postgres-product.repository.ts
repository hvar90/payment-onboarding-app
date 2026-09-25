import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../persistence/entities/product.entity';
import { ProductModel } from '../../domain/product.model';

@Injectable()
export class PostgresProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async findAll(): Promise<ProductModel[]> {
    const entities = await this.repository.find();
    return entities.map(
      (e) => new ProductModel(e.id, e.name, e.description, e.price, e.stock),
    );
  }
}