import { FindOrCreateCustomerUseCase } from './find-or-create-customer.use-case';
import { ICustomerRepository } from '../../domain/customer.repository.interface';
import { CustomerModel } from '../../domain/customer.model';

describe('FindOrCreateCustomerUseCase', () => {
  let useCase: FindOrCreateCustomerUseCase;
  let customerRepositoryMock: jest.Mocked<ICustomerRepository>;

  beforeEach(() => {
    customerRepositoryMock = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    useCase = new FindOrCreateCustomerUseCase(customerRepositoryMock);
  });

  it('should return an existing customer if found by email', async () => {
    const existingCustomer = new CustomerModel(
      '1',
      'Heberth Vargas',
      'test@example.com',
      '3001234567',
      new Date(),
    );

    customerRepositoryMock.findByEmail.mockResolvedValue(existingCustomer);

    const result = await useCase.execute({
      name: 'Heberth Vargas',
      email: 'test@example.com',
      phone: '3001234567',
    });

    expect(result).toEqual(existingCustomer);
    expect(customerRepositoryMock.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(customerRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('should create and save a new customer if not found by email', async () => {
    customerRepositoryMock.findByEmail.mockResolvedValue(null);
    customerRepositoryMock.save.mockImplementation(async (customer) => customer);

    const result = await useCase.execute({
      name: 'New User',
      email: 'new@example.com',
      phone: '3009876543',
    });

    expect(result).toBeDefined();
    expect(result.name).toBe('New User');
    expect(result.email).toBe('new@example.com');
    expect(result.phone).toBe('3009876543');
    expect(customerRepositoryMock.save).toHaveBeenCalledTimes(1);
  });
});