import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from '../../store/checkoutSlice';
import { CheckoutSummary } from '../CheckoutSummary';

// Mock global de fetch
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

const renderWithStore = (initialState = {}) => {
  const store = configureStore({
    reducer: {
      checkout: checkoutReducer,
    },
    preloadedState: {
      checkout: {
        step: 3,
        selectedProductId: 'prod-1',
        customerData: {
          email: 'test@example.com',
          fullName: 'Heberth Vargas',
        },
        cardData: {
          cardNumber: '4000000000000000',
          cardHolder: 'HEBERTH VARGAS',
          expiry: '12/28',
          cvc: '123',
          token: 'tok_test_123',
          installments: 1,
        },
        transactionResult: null,
        ...initialState,
      },
    },
  });

  return {
    ...render(
      <Provider store={store}>
        <CheckoutSummary />
      </Provider>
    ),
    store,
  };
};

describe('CheckoutSummary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders summary details and loads product successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 'prod-1',
          name: 'TalkFi Premium',
          description: 'Suscripción anual',
          price: 5000000,
          currency: 'COP',
        },
      ],
    });

    renderWithStore();

    expect(await screen.findByText('TalkFi Premium')).toBeInTheDocument();
    expect(screen.getByText('Suscripción anual')).toBeInTheDocument();
    expect(screen.getByText('Heberth Vargas')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  test('handles product fetch error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithStore();

    await waitFor(() => {
      expect(
        screen.getByText(/No se pudo cargar la información del producto/i)
      ).toBeInTheDocument();
    });
  });

  test('dispatches back step when Volver button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 'prod-1',
          name: 'TalkFi Premium',
          description: 'Suscripción anual',
          price: 5000000,
          currency: 'COP',
        },
      ],
    });

    const { store } = renderWithStore();

    await screen.findByText('TalkFi Premium');

    const backButton = screen.getByRole('button', { name: /volver/i });
    fireEvent.click(backButton);

    expect(store.getState().checkout.step).toBe(2);
  });

  test('processes payment successfully and advances to step 4', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 'prod-1',
          name: 'TalkFi Premium',
          description: 'Suscripción anual',
          price: 5000000,
          currency: 'COP',
        },
      ],
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'tx-uuid-999',
        status: 'APPROVED',
        reference: 'ref-test-123',
      }),
    });

    const { store } = renderWithStore();

    await screen.findByText('TalkFi Premium');

    const payButton = screen.getByRole('button', { name: /confirmar y pagar/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(store.getState().checkout.step).toBe(4);
      expect(store.getState().checkout.transactionResult).toEqual({
        id: 'tx-uuid-999',
        status: 'APPROVED',
        reference: 'ref-test-123',
      });
    });
  });

  test('handles payment failure and shows error message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 'prod-1',
          name: 'TalkFi Premium',
          description: 'Suscripción anual',
          price: 5000000,
          currency: 'COP',
        },
      ],
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Fondos insuficientes',
      }),
    });

    renderWithStore();

    await screen.findByText('TalkFi Premium');

    const payButton = screen.getByRole('button', { name: /confirmar y pagar/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(screen.getByText('⚠️ Fondos insuficientes')).toBeInTheDocument();
    });
  });
});