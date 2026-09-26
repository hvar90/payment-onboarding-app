import { Inject, Injectable } from '@nestjs/common';
import { IProductRepository } from '../../domain/product.repository.interface';
import { ProductModel } from '../../domain/product.model';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(): Promise<ProductModel[]> {
    return await this.productRepository.findAll();
  }
}