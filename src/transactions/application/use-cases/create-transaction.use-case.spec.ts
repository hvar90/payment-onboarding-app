import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from './create-transaction.use-case';
import { PostgresTransactionRepository } from '../../infrastructure/persistence/adapters/postgres-transaction.repository';
import { ApiAdapter } from '../../infrastructure/gateways/api.adapter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductEntity } from '../../../products/infrastructure/persistence/entities/product.entity';
import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let productRepository: any;
  let transactionRepository: any;
  let apiAdapter: any;
  let dataSource: any;
  let queryRunner: any;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
      },
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    };

    productRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      }),
    };

    transactionRepository = {
      save: jest.fn().mockResolvedValue({ id: '1', reference: 'TX-123' }),
      updateStatus: jest.fn(),
    };

    apiAdapter = {
      charge: jest.fn().mockResolvedValue({ id: 'gw_123', status: 'APPROVED' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        { provide: PostgresTransactionRepository, useValue: transactionRepository },
        { provide: ApiAdapter, useValue: apiAdapter },
        { provide: getRepositoryToken(ProductEntity), useValue: productRepository },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
  });

  it('should successfully create a transaction and update stock when approved', async () => {
    const mockProduct = { id: 'prod-1', price: 100000, stock: 5 };
    queryRunner.manager.findOne.mockResolvedValue(mockProduct);

    const dto = {
      productId: 'prod-1',
      customerData: { email: 'test@example.co', name: 'Heberth' },
      cardData: { token: 'tok_test_123' },
    };

    const result = await useCase.execute(dto);

    expect(result.status).toEqual('APPROVED');
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(transactionRepository.updateStatus).toHaveBeenCalled();
    expect(productRepository.createQueryBuilder).toHaveBeenCalled();
  });

  it('should throw NotFoundException if product does not exist or out of stock', async () => {
    queryRunner.manager.findOne.mockResolvedValue(null);

    const dto = {
      productId: 'invalid-id',
      customerData: { email: 'test@wompi.co', name: 'Heberth' },
      cardData: { token: 'tok_test_123' },
    };

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
  });
});