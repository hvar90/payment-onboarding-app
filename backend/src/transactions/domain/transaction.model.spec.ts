import { TransactionModel } from './transaction.model';

describe('TransactionModel', () => {
  it('should create an instance of TransactionModel', () => {
    const model = new TransactionModel(
      '1',
      'REF-123',
      'PENDING',
      10000,
      'prod-1',
      { email: 'test@test.com' },
      'gateway-1',
    );
    expect(model).toBeDefined();
    expect(model.id).toEqual('1');
    expect(model.reference).toEqual('REF-123');
    expect(model.status).toEqual('PENDING');
  });
});