import { Injectable, Inject } from '@nestjs/common';
import { PostgresProductRepository } from '../infrastructure/adapters/postgres-product.repository';
import { ProductModel } from '../domain/product.model';

@Injectable()
export class GetProductsUseCase {
  constructor(
    private readonly productRepository: PostgresProductRepository,
  ) {}

  async execute(): Promise<ProductModel[]> {
    return await this.productRepository.findAll();
  }
}