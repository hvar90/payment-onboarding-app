import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';

describe('ProductsController', () => {
  let controller: ProductsController;
  let useCase: GetProductsUseCase;

  const mockGetProductsUseCase = {
    execute: jest.fn().mockResolvedValue([{ id: '1', name: 'Product 1', stock: 10, priceInCents: 50000 }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: GetProductsUseCase,
          useValue: mockGetProductsUseCase,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    useCase = module.get<GetProductsUseCase>(GetProductsUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of products', async () => {
      const result = await controller.getAll();
      expect(result).toEqual([{ id: '1', name: 'Product 1', stock: 10, priceInCents: 50000 }]);
      expect(useCase.execute).toHaveBeenCalled();
    });
  });
});