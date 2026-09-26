import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from '../../store/checkoutSlice';
import { ProductSelection } from '../ProductSelection';

const mockProducts = [
  {
    id: 'prod-1',
    name: 'Plan Premium',
    description: 'Suscripción mensual avanzada',
    price: 5000000,
    currency: 'COP',
    stock: 10,
  },
  {
    id: 'prod-2',
    name: 'Plan Agotado',
    description: 'Sin stock disponible',
    price: 1000000,
    currency: 'COP',
    stock: 0,
  },
];

const renderWithRedux = (ui: React.ReactElement, initialState: Record<string, unknown> = {}) => {
  const store = configureStore({
    reducer: { checkout: checkoutReducer },
    preloadedState: { checkout: initialState as never },
  });
  return { ...render(<Provider store={store}>{ui}</Provider>), store };
};

describe('ProductSelection Component', () => {
  beforeEach(() => {
    (globalThis as { fetch: unknown }).fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially and then lists products with stock info', async () => {
    renderWithRedux(<ProductSelection />);
    
    expect(screen.getByText(/Cargando productos disponibles.../i)).toBeInTheDocument();

    const productTitle = await screen.findByText('Plan Premium');
    expect(productTitle).toBeInTheDocument();
    expect(screen.getByText('Suscripción mensual avanzada')).toBeInTheDocument();
    expect(screen.getByText('Disponibles: 10 un.')).toBeInTheDocument();
    expect(screen.getByText('Agotado (0 unidades)')).toBeInTheDocument();
  });

  test('allows selecting an available product and advancing step', async () => {
    const { store } = renderWithRedux(<ProductSelection />);

    const productCard = await screen.findByText('Plan Premium');
    fireEvent.click(productCard);

    expect(store.getState().checkout.selectedProductId).toBe('prod-1');

    const nextButton = screen.getByRole('button', { name: /Continuar con el Pago/i });
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);
    expect(store.getState().checkout.step).toBe(2);
  });

  test('prevents selecting an out-of-stock product', async () => {
    const { store } = renderWithRedux(<ProductSelection />);

    const outOfStockCard = await screen.findByText('Plan Agotado');
    fireEvent.click(outOfStockCard);

    expect(store.getState().checkout.selectedProductId).toBeUndefined();
  });

  test('handles fetch API error response gracefully', async () => {
    ((globalThis as { fetch: unknown }).fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
      })
    );

    renderWithRedux(<ProductSelection />);

    const errorMessage = await screen.findByText(/No se pudieron cargar los productos/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('handles network exception during fetch gracefully', async () => {
    ((globalThis as { fetch: unknown }).fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network Error'))
    );

    renderWithRedux(<ProductSelection />);

    const errorMessage = await screen.findByText(/Network Error/i);
    expect(errorMessage).toBeInTheDocument();
  });
});