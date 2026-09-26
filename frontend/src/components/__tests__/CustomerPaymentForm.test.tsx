import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from '../../store/checkoutSlice';
import { CustomerPaymentForm } from '../CustomerPaymentForm';

const renderWithRedux = (initialState = {}) => {
  const store = configureStore({
    reducer: { checkout: checkoutReducer },
    preloadedState: {
      checkout: {
        step: 2,
        selectedProductId: 'prod-1',
        customerData: null,
        cardData: null,
        transactionResult: null,
        ...initialState,
      },
    },
  });
  return { ...render(<Provider store={store}><CustomerPaymentForm /></Provider>), store };
};

describe('CustomerPaymentForm Component', () => {
  test('renders form inputs correctly with preloaded state', () => {
    renderWithRedux({
      customerData: { fullName: 'Heberth Vargas', email: 'heberth@example.com' },
      cardData: {
        cardNumber: '4000000000000000',
        cardHolder: 'HEBERTH VARGAS',
        expiry: '12/28',
        cvc: '123',
        token: 'tok_123',
        installments: 3,
      },
    });
    expect(screen.getByDisplayValue('Heberth Vargas')).toBeInTheDocument();
    expect(screen.getByDisplayValue('heberth@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4000000000000000')).toBeInTheDocument();
  });

  test('shows validation error when submitting empty form', () => {
    renderWithRedux();
    const submitButton = screen.getByText('Continuar con el Pago (Wompi)');
    
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/Por favor completa todos los datos del cliente/i)).toBeInTheDocument();
  });

  test('validates email format strictly and shows error', () => {
    renderWithRedux();
    
    fireEvent.change(screen.getByPlaceholderText('Ej. Heberth Vargas'), { target: { value: 'Heberth Vargas' } });
    fireEvent.change(screen.getByPlaceholderText('correo@ejemplo.com'), { target: { value: 'correo-invalido' } });
    fireEvent.change(screen.getByPlaceholderText('4000000000000000'), { target: { value: '4000000000000000' } });
    fireEvent.change(screen.getByPlaceholderText('COMO APARECE EN LA TARJETA'), { target: { value: 'HEBERTH' } });
    fireEvent.change(screen.getByPlaceholderText('MM/AA'), { target: { value: '12/28' } });
    fireEvent.change(screen.getByPlaceholderText('123'), { target: { value: '123' } });

    fireEvent.click(screen.getByText('Continuar con el Pago (Wompi)'));

    expect(screen.getByText(/correo electrónico válido/i)).toBeInTheDocument();
  });

  test('validates card number length (less than 13 digits)', () => {
    renderWithRedux();
    
    fireEvent.change(screen.getByPlaceholderText('Ej. Heberth Vargas'), { target: { value: 'Heberth Vargas' } });
    fireEvent.change(screen.getByPlaceholderText('correo@ejemplo.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('4000000000000000'), { target: { value: '4000123' } });
    fireEvent.change(screen.getByPlaceholderText('COMO APARECE EN LA TARJETA'), { target: { value: 'HEBERTH' } });
    fireEvent.change(screen.getByPlaceholderText('MM/AA'), { target: { value: '12/28' } });
    fireEvent.change(screen.getByPlaceholderText('123'), { target: { value: '123' } });

    fireEvent.click(screen.getByText('Continuar con el Pago (Wompi)'));

    expect(screen.getByText(/El número de tarjeta debe tener entre 13 y 16 dígitos/i)).toBeInTheDocument();
  });

  test('validates missing card holder', () => {
    renderWithRedux();
    
    fireEvent.change(screen.getByPlaceholderText('Ej. Heberth Vargas'), { target: { value: 'Heberth Vargas' } });
    fireEvent.change(screen.getByPlaceholderText('correo@ejemplo.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('4000000000000000'), { target: { value: '4000000000000000' } });
    fireEvent.change(screen.getByPlaceholderText('COMO APARECE EN LA TARJETA'), { target: { value: '   ' } });
    fireEvent.change(screen.getByPlaceholderText('MM/AA'), { target: { value: '12/28' } });
    fireEvent.change(screen.getByPlaceholderText('123'), { target: { value: '123' } });

    fireEvent.click(screen.getByText('Continuar con el Pago (Wompi)'));

    expect(screen.getByText(/Por favor ingresa el titular de la tarjeta/i)).toBeInTheDocument();
  });

  test('validates invalid expiry date format or past date', () => {
    renderWithRedux();
    
    fireEvent.change(screen.getByPlaceholderText('Ej. Heberth Vargas'), { target: { value: 'Heberth Vargas' } });
    fireEvent.change(screen.getByPlaceholderText('correo@ejemplo.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('4000000000000000'), { target: { value: '4000000000000000' } });
    fireEvent.change(screen.getByPlaceholderText('COMO APARECE EN LA TARJETA'), { target: { value: 'HEBERTH' } });
    fireEvent.change(screen.getByPlaceholderText('MM/AA'), { target: { value: '01/20' } });
    fireEvent.change(screen.getByPlaceholderText('123'), { target: { value: '123' } });

    fireEvent.click(screen.getByText('Continuar con el Pago (Wompi)'));

    expect(screen.getByText(/Fecha de expiración inválida/i)).toBeInTheDocument();
  });

  test('validates CVC minimum length', () => {
    renderWithRedux();
    
    fireEvent.change(screen.getByPlaceholderText('Ej. Heberth Vargas'), { target: { value: 'Heberth Vargas' } });
    fireEvent.change(screen.getByPlaceholderText('correo@ejemplo.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('4000000000000000'), { target: { value: '4000000000000000' } });
    fireEvent.change(screen.getByPlaceholderText('COMO APARECE EN LA TARJETA'), { target: { value: 'HEBERTH' } });
    fireEvent.change(screen.getByPlaceholderText('MM/AA'), { target: { value: '12/28' } });
    fireEvent.change(screen.getByPlaceholderText('123'), { target: { value: '12' } });

    fireEvent.click(screen.getByText('Continuar con el Pago (Wompi)'));

    expect(screen.getByText(/El código CVC\/CVV debe tener al menos 3 dígitos/i)).toBeInTheDocument();
  });

  test('tests input sanitization handlers and edge branches', () => {
    const { store } = renderWithRedux();

    const fullNameInput = screen.getByPlaceholderText('Ej. Heberth Vargas');
    const emailInput = screen.getByPlaceholderText('correo@ejemplo.com');
    const expiryInput = screen.getByPlaceholderText('MM/AA');
    const cvcInput = screen.getByPlaceholderText('123');

    fireEvent.change(fullNameInput, { target: { value: 'Heberth 123!' } });
    expect(fullNameInput).toHaveValue('Heberth ');

    fireEvent.change(emailInput, { target: { value: 'test@@example..com' } });
    expect(emailInput).toHaveValue('test@example.com');

    fireEvent.change(expiryInput, { target: { value: '25/28' } });
    fireEvent.change(expiryInput, { target: { value: '1328' } });
    fireEvent.change(expiryInput, { target: { value: '1228' } });

    fireEvent.change(cvcInput, { target: { value: '12345' } });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '3' } });
    expect(store.getState().checkout.cardData?.installments).toBe(3);
  });

  test('handles go back button correctly', () => {
    const { store } = renderWithRedux();
    const backButton = screen.getByText('Volver');
    fireEvent.click(backButton);
    expect(store.getState().checkout.step).toBe(1);
  });

  test('proceeds successfully to step 3 when all validations pass', () => {
    const { store } = renderWithRedux();

    fireEvent.change(screen.getByPlaceholderText('Ej. Heberth Vargas'), { target: { value: 'Heberth Vargas' } });
    fireEvent.change(screen.getByPlaceholderText('correo@ejemplo.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('4000000000000000'), { target: { value: '4000000000000000' } });
    fireEvent.change(screen.getByPlaceholderText('COMO APARECE EN LA TARJETA'), { target: { value: 'HEBERTH VARGAS' } });
    fireEvent.change(screen.getByPlaceholderText('MM/AA'), { target: { value: '12/28' } });
    fireEvent.change(screen.getByPlaceholderText('123'), { target: { value: '123' } });

    fireEvent.click(screen.getByText('Continuar con el Pago (Wompi)'));

    expect(store.getState().checkout.step).toBe(3);
  });
});