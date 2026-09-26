import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store/store';
import { resetCheckout } from './store/checkoutSlice';
import { ProductSelection } from './components/ProductSelection';
import { CustomerPaymentForm } from './components/CustomerPaymentForm';
import { CheckoutSummary } from './components/CheckoutSummary';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const step = useSelector((state: RootState) => state.checkout.step);
  const transactionResult = useSelector((state: RootState) => state.checkout.transactionResult);

  const handleReturnToStore = () => {
    dispatch(resetCheckout());
  };

  return (
    <main style={styles.mainContainer}>
      <div style={styles.appHeader}>
        <h1 style={styles.mainTitle}>Pasarela de Pagos</h1>
        <p style={styles.mainSubtitle}>Simulador de pagos integrado con NestJS</p>
      </div>

      {step === 1 && <ProductSelection />}
      {step === 2 && <CustomerPaymentForm />}
      {step === 3 && <CheckoutSummary />}
      {step === 4 && (
        <div style={styles.successContainer}>
          <h2 style={styles.successTitle}>¡Transacción Exitosa!</h2>
          <p style={styles.successText}>Tu pago ha sido procesado correctamente por la pasarela.</p>
          <div style={styles.resultBox}>
            <p><strong>ID Transacción:</strong> {transactionResult?.id}</p>
            <p><strong>Estado:</strong> {transactionResult?.status}</p>
            <p><strong>Referencia:</strong> {transactionResult?.reference}</p>
          </div>
          <button
            onClick={handleReturnToStore}
            style={styles.successButton}
          >
            Volver al inicio (Ver stock actualizado)
          </button>
        </div>
      )}
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  mainContainer: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '48px 16px',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  appHeader: {
    maxWidth: '600px',
    margin: '0 auto 32px auto',
    textAlign: 'center',
  },
  mainTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#111827',
    margin: 0,
  },
  mainSubtitle: {
    fontSize: '14px',
    color: '#4b5563',
    marginTop: '8px',
    margin: 0,
  },
  successContainer: {
    maxWidth: '520px',
    width: '100%',
    margin: '24px auto',
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  successTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#16a34a',
    margin: 0,
  },
  successText: {
    fontSize: '14px',
    color: '#4b5563',
    margin: 0,
  },
  resultBox: {
    padding: '14px 16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    textAlign: 'left',
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#374151',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  successButton: {
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '14px',
    color: '#ffffff',
    backgroundColor: '#4f46e5',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
};

export default App;