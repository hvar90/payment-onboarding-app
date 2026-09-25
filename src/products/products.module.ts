import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './infrastructure/persistence/entities/product.entity';
import { ProductsController } from './infrastructure/controllers/products.controller';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { PostgresProductRepository } from './infrastructure/persistence/adapters/postgres-product.repository';
import { IProductRepository } from './domain/product.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductsController],
  providers: [
    GetProductsUseCase,
    {
      provide: IProductRepository,
      useClass: PostgresProductRepository,
    },
  ],
})
export class ProductsModule {}