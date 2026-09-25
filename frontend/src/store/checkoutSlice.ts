import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface CheckoutState {
  step: number; // 1: Productos, 2: Pago/Entrega, 3: Resumen, 4: Resultado
  selectedProductId: string | null;
  customerData: {
    email: string;
    fullName: string;
  } | null;
  cardData: {
    token: string;
    installments: number;
  } | null;
  transactionResult: any | null;
}

// Cargar estado inicial desde localStorage para cumplir con la resiliencia ante un refresh
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
    setCardData: (state, action: PayloadAction<{ token: string; installments: number }>) => {
      state.cardData = action.payload;
      localStorage.setItem('wompi_checkout_state', JSON.stringify(state));
    },
    setTransactionResult: (state, action: PayloadAction<any>) => {
      state.transactionResult = action.payload;
      localStorage.setItem('wompi_checkout_state', JSON.stringify(state));
    },
    resetCheckout: (state) => {
      state.step = 1;
      state.selectedProductId = null;
      state.customerData = null;
      state.cardData = null;
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
  setTransactionResult,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;