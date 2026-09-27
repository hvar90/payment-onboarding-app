import { Controller, Get } from '@nestjs/common';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';

@Controller('products')
export class ProductsController {
  constructor(private readonly getProductsUseCase: GetProductsUseCase) {}

  @Get()
  async getAll() {
    return await this.getProductsUseCase.execute();
  }
}