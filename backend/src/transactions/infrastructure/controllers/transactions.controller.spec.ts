import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let useCase: CreateTransactionUseCase;

  const mockCreateTransactionUseCase = {
    execute: jest.fn().mockResolvedValue({ id: 'tx-123', status: 'APPROVED' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: CreateTransactionUseCase,
          useValue: mockCreateTransactionUseCase,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a transaction successfully', async () => {
    const dto: any = {
      productId: 'prod-1',
      customerData: { email: 'test@mail.com', fullName: 'Test User' },
      cardData: { token: 'tok_123', installments: 1 },
      deliveryData: { address: 'Calle 100', city: 'Cali' },
    };
    const result = await controller.create(dto);
    expect(result).toEqual({ id: 'tx-123', status: 'APPROVED' });
    expect(useCase.execute).toHaveBeenCalledWith(dto);
  });
});