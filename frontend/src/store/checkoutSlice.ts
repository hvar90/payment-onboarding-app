import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface TransactionResult {
  gatewayId?: string;
  status?: string;
  reference?: string;
  amountInCents?: number;
  currency?: string;
  customerEmail?: string;
  [key: string]: unknown;
}

interface CheckoutState {
  step: number;
  selectedProductId: string | null;
  customerData: {
    email: string;
    fullName: string;
  } | null;
  cardData: {
    cardNumber: string;
    cardHolder: string;
    expiry: string;
    cvc: string;
    token: string;
    installments: number;
  } | null;
  deliveryData: {
    address: string;
    city: string;
  } | null;
  transactionResult: TransactionResult | null;
}

const loadInitialState = (): CheckoutState => {
  try {
    const savedState = localStorage.getItem('wompi_checkout_state');
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (e) {
    console.error('Could not load state from localStorage', e);
  }
  return {
    step: 1,
    selectedProductId: null,
    customerData: null,
    cardData: null,
    deliveryData: null,
    transactionResult: null,
  };
};

const initialState: CheckoutState = loadInitialState();

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
      localStorage.setItem('wompi_checkout_state', JSON.stringify(state));
    },
    setSelectedProduct: (state, action: PayloadAction<string>) => {
      state.selectedProductId = action.payload;
      localStorage.setItem('wompi_checkout_state', JSON.stringify(state));
    },
    setCustomerData: (state, action: PayloadAction<{ email: string; fullName: string }>) => {
      state.customerData = action.payload;
      localStorage.setItem('wompi_checkout_state', JSON.stringify(state));
    },
    setCardData: (
      state,
      action: PayloadAction<{
        cardNumber: string;
        cardHolder: string;
        expiry: string;
        cvc: string;
        token: string;
        installments: number;
      }>
    ) => {
      state.cardData = action.payload;
      localStorage.setItem('wompi_checkout_state', JSON.stringify(state));
    },
    setDeliveryData: (state, action: PayloadAction<{ address: string; city: string }>) => {
      state.deliveryData = action.payload;
      localStorage.setItem('wompi_checkout_state', JSON.stringify(state));
    },
    setTransactionResult: (state, action: PayloadAction<TransactionResult>) => {
      state.transactionResult = action.payload;
      localStorage.setItem('wompi_checkout_state', JSON.stringify(state));
    },
    resetCheckout: (state) => {
      state.step = 1;
      state.selectedProductId = null;
      state.customerData = null;
      state.cardData = null;
      state.deliveryData = null;
      state.transactionResult = null;
      localStorage.removeItem('wompi_checkout_state');
    },
  },
});

export const {
  setStep,
  setSelectedProduct,
  setCustomerData,
  setCardData,
  setDeliveryData,
  setTransactionResult,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;