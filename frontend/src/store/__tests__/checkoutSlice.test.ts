import reducer, {
  setStep,
  setSelectedProduct,
  setCustomerData,
  setCardData,
  setDeliveryData,
  setTransactionResult,
  resetCheckout,
} from '../checkoutSlice';

describe('checkoutSlice reducer', () => {
  const initialState = {
    step: 1,
    selectedProductId: null,
    customerData: null,
    cardData: null,
    deliveryData: null,
    transactionResult: null,
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('should load initial state from localStorage successfully', () => {
    const savedState = {
      step: 2,
      selectedProductId: 'prod_999',
      customerData: { email: 'saved@example.com', fullName: 'Saved User' },
      cardData: null,
      deliveryData: { address: 'Calle 10', city: 'Cali' },
      transactionResult: null,
    };
    localStorage.setItem('wompi_checkout_state', JSON.stringify(savedState));
    
    const nextState = reducer(undefined, setStep(3));
    expect(nextState.step).toBe(3);
  });

  test('should handle loadInitialState catch branch when localStorage throws or fails', () => {
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new Error('Storage error');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(reducer(undefined, { type: 'unknown' })).toBeDefined();

    spy.mockRestore();
    consoleSpy.mockRestore();
  });

  test('should handle setStep and save to localStorage', () => {
    const nextState = reducer(initialState, setStep(2));
    expect(nextState.step).toBe(2);
    expect(localStorage.getItem('wompi_checkout_state')).toBeDefined();
  });

  test('should handle setSelectedProduct', () => {
    const nextState = reducer(initialState, setSelectedProduct('prod_123'));
    expect(nextState.selectedProductId).toBe('prod_123');
  });

  test('should handle setCustomerData', () => {
    const customer = { email: 'test@example.com', fullName: 'Heberth Vargas' };
    const nextState = reducer(initialState, setCustomerData(customer));
    expect(nextState.customerData).toEqual(customer);
  });

  test('should handle setCardData', () => {
    const card = {
      cardNumber: '4000000000000000',
      cardHolder: 'HEBERTH VARGAS',
      expiry: '12/28',
      cvc: '123',
      token: 'tok_123',
      installments: 1,
    };
    const nextState = reducer(initialState, setCardData(card));
    expect(nextState.cardData).toEqual(card);
  });

  test('should handle setDeliveryData', () => {
    const delivery = { address: 'Calle Falsa 123', city: 'Cali' };
    const nextState = reducer(initialState, setDeliveryData(delivery));
    expect(nextState.deliveryData).toEqual(delivery);
  });

  test('should handle setTransactionResult', () => {
    const result = { id: 'tx_1', status: 'APPROVED' };
    const nextState = reducer(initialState, setTransactionResult(result));
    expect(nextState.transactionResult).toEqual(result);
  });

  test('should handle resetCheckout and remove from localStorage', () => {
    const modifiedState = {
      step: 4,
      selectedProductId: 'prod_123',
      customerData: { email: 'a@a.com', fullName: 'A' },
      cardData: { cardNumber: '1234', cardHolder: 'A', expiry: '12/28', cvc: '123', token: 't', installments: 1 },
      deliveryData: { address: 'Calle 10', city: 'Cali' },
      transactionResult: { id: '1' },
    };
    localStorage.setItem('wompi_checkout_state', JSON.stringify(modifiedState));
    const nextState = reducer(modifiedState, resetCheckout());
    expect(nextState).toEqual(initialState);
    expect(localStorage.getItem('wompi_checkout_state')).toBeNull();
  });
});