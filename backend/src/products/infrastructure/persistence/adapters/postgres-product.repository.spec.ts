import { Test, TestingModule } from '@nestjs/testing';
import { PostgresProductRepository } from './postgres-product.repository';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductEntity } from '../entities/product.entity';

describe('PostgresProductRepository', () => {
  let repository: PostgresProductRepository;
  let repoMock: Repository<ProductEntity>;

  const mockRepo = {
    find: jest.fn().mockResolvedValue([{ id: '1', name: 'Test', stock: 5, priceInCents: 1000 }] ),
    findOne: jest.fn().mockResolvedValue({ id: '1', name: 'Test', stock: 5, priceInCents: 1000 }),
    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostgresProductRepository,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();

    repository = module.get<PostgresProductRepository>(PostgresProductRepository);
    repoMock = module.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should find all products', async () => {
    const products = await repository.findAll();
    expect(products.length).toBeGreaterThan(0);
    expect(repoMock.find).toHaveBeenCalled();
  });
});