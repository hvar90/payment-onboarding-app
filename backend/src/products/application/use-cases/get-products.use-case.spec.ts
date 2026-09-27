import { GetProductsUseCase } from './get-products.use-case';
import { IProductRepository } from '../../domain/product.repository.interface';
import { ProductModel } from '../../domain/product.model';

describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let productRepositoryMock: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    productRepositoryMock = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
    };

    useCase = new GetProductsUseCase(productRepositoryMock);
  });

  it('should return an array of products', async () => {
    const mockProducts: ProductModel[] = [
      new ProductModel('1', 'Producto Test', 'Descripción test', 50000, 10),
    ];

    productRepositoryMock.findAll.mockResolvedValue(mockProducts);

    const result = await useCase.execute();

    expect(result).toEqual(mockProducts);
    expect(productRepositoryMock.findAll).toHaveBeenCalledTimes(1);
  });
});