import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './infrastructure/persistence/entities/product.entity';
import { ProductsController } from './infrastructure/controllers/products.controller';
import { GetProductsUseCase } from './application/get-products.use-case';
import { PostgresProductRepository } from './infrastructure/adapters/postgres-product.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductsController],
  providers: [GetProductsUseCase, PostgresProductRepository],
})
export class ProductsModule {}