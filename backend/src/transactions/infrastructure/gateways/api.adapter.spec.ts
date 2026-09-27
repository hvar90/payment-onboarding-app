import { Test, TestingModule } from '@nestjs/testing';
import { ApiAdapter } from './api.adapter';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiAdapter', () => {
  let adapter: ApiAdapter;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiAdapter],
    }).compile();

    adapter = module.get<ApiAdapter>(ApiAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should process charge successfully via axios', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { data: { id: 'example-txn-999', status: 'APPROVED' } },
    });

    const paymentData = {
      amountInCents: 50000,
      currency: 'COP',
      customerEmail: 'test@mail.com',
      paymentMethod: {
        type: 'CARD',
        installments: 1,
        token: 'tok_123',
      },
      reference: 'ref-001',
    };

    const result = await adapter.charge(paymentData);
    expect(result).toEqual({ id: 'example-txn-999', status: 'APPROVED' });
    expect(mockedAxios.post).toHaveBeenCalled();
  });
});