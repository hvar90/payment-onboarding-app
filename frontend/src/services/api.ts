import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tipado basado en ProductEntity del backend
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number; 
  stock: number;
  createdAt: string;
  updated_at: string;
}

// Tipado basado exactamente en CreateTransactionDto del backend
export interface CustomerDataPayload {
  email: string;
  fullName: string;
}

export interface CardDataPayload {
  token: string;
  installments: number;
}

export interface CreateTransactionPayload {
  productId: string;
  customerData: CustomerDataPayload;
  cardData: CardDataPayload;
}

// Métodos del servicio
export const productService = {
  async getProducts(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },
};

export const transactionService = {
  async createTransaction(data: CreateTransactionPayload) {
    const response = await api.post('/transactions', data);
    return response.data;
  },
};