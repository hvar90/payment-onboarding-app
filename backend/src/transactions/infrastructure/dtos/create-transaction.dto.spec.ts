import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTransactionDto } from './create-transaction.dto';

describe('CreateTransactionDto', () => {
  it('should validate successfully with correct data', async () => {
    const plainData = {
      productId: 'prod-1',
      customerData: { email: 'test@example.com', fullName: 'Test User' },
      cardData: {
        cardNumber: '4000000000000000',
        cardHolder: 'TEST USER',
        expiry: '12/28',
        cvc: '123',
        token: 'tok_123',
        installments: 1,
      },
      deliveryData: { address: 'Calle 100', city: 'Cali' },
    };

    const dto = plainToInstance(CreateTransactionDto, plainData);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when fields are missing', async () => {
    const dto = new CreateTransactionDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});