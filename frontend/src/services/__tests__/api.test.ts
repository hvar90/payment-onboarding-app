import { productService, transactionService, api } from '../api';

// Mock de la instancia de axios
jest.mock('axios', () => {
  const mAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
  };
  return {
    create: jest.fn(() => mAxiosInstance),
  };
});

describe('API Services Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('productService', () => {
    test('getProducts should fetch and return product list successfully', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Plan Premium',
          description: 'Suscripción mensual',
          price: 5000000,
          stock: 5,
          createdAt: '2026-01-01',
          updated_at: '2026-01-01',
        },
      ];

      (api.get as jest.Mock).mockResolvedValueOnce({ data: mockProducts });

      const result = await productService.getProducts();
      expect(result).toEqual(mockProducts);
      expect(api.get).toHaveBeenCalledWith('/products');
    });

    test('getProducts should throw an error when request fails', async () => {
      (api.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(productService.getProducts()).rejects.toThrow('Network error');
      expect(api.get).toHaveBeenCalledWith('/products');
    });
  });

  describe('transactionService', () => {
    test('createTransaction should send a POST request with payload and return response data', async () => {
      const mockPayload = {
        productId: 'prod-1',
        customerData: { email: 'test@example.com', fullName: 'Heberth Vargas' },
        cardData: { token: 'tok_test_123', installments: 2 },
      };

      const mockResponseData = {
        id: 'tx-uuid-123',
        status: 'APPROVED',
        reference: 'ref-999',
      };

      (api.post as jest.Mock).mockResolvedValueOnce({ data: mockResponseData });

      const result = await transactionService.createTransaction(mockPayload);
      expect(result).toEqual(mockResponseData);
      expect(api.post).toHaveBeenCalledWith('/transactions', mockPayload);
    });

    test('createTransaction should throw an error when transaction request fails', async () => {
      const mockPayload = {
        productId: 'prod-1',
        customerData: { email: 'test@example.com', fullName: 'Heberth Vargas' },
        cardData: { token: 'tok_test_123', installments: 1 },
      };

      (api.post as jest.Mock).mockRejectedValueOnce(new Error('Bad Request'));

      await expect(transactionService.createTransaction(mockPayload)).rejects.toThrow('Bad Request');
      expect(api.post).toHaveBeenCalledWith('/transactions', mockPayload);
    });
  });
});