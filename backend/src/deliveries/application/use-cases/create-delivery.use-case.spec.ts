import { CreateDeliveryUseCase } from './create-delivery.use-case';
import { IDeliveryRepository } from '../../domain/delivery.repository.interface';

describe('CreateDeliveryUseCase', () => {
  let useCase: CreateDeliveryUseCase;
  let deliveryRepositoryMock: jest.Mocked<IDeliveryRepository>;

  beforeEach(() => {
    deliveryRepositoryMock = {
      save: jest.fn(),
      findById: jest.fn(),
      findByTransactionId: jest.fn(),
    };

    useCase = new CreateDeliveryUseCase(deliveryRepositoryMock);
  });

  it('should create and save a new delivery with PREPARING status', async () => {
    deliveryRepositoryMock.save.mockImplementation(async (delivery) => delivery);

    const params = {
      transactionId: 'tx-12345',
      address: 'Calle 100 # 15-20',
      city: 'Bogotá',
    };

    const result = await useCase.execute(params);

    expect(result).toBeDefined();
    expect(result.transactionId).toBe(params.transactionId);
    expect(result.address).toBe(params.address);
    expect(result.city).toBe(params.city);
    expect(result.status).toBe('PREPARING');
    expect(deliveryRepositoryMock.save).toHaveBeenCalledTimes(1);
  });
});