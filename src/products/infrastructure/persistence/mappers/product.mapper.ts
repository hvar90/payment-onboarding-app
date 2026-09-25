import { ProductModel } from '../../../domain/product.model';
import { ProductEntity } from '../entities/product.entity';

export class ProductMapper {
  static toDomain(entity: ProductEntity): ProductModel | null {
    if (!entity) return null;
    return new ProductModel(
      entity.id,
      entity.name,
      entity.description,
      Number(entity.price), // Convertimos a número por seguridad ya que TypeORM devuelve los decimales como string
      entity.stock,
    );
  }

  static toPersistence(model: ProductModel): ProductEntity | null{
    if (!model) return null;
    const entity = new ProductEntity();
    entity.id = model.id;
    entity.name = model.name;
    entity.description = model.description;
    entity.price = model.price;
    entity.stock = model.stock;
    return entity;
  }
}