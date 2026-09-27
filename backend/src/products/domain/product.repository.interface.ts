import { ProductModel } from './product.model';

export interface IProductRepository {
  findAll(): Promise<ProductModel[]>;
  findById(id: string): Promise<ProductModel | null>;
  updateStock(id: string, newStock: number): Promise<void>;
}

export const IProductRepository = Symbol('IProductRepository');