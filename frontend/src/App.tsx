import { useSelector } from 'react-redux';
import type { RootState } from './store/store';
import { ProductSelection } from './components/ProductSelection';
import { CustomerPaymentForm } from './components/CustomerPaymentForm';
import { CheckoutSummary } from './components/CheckoutSummary';
import './App.css';

function App() {
  const step = useSelector((state: RootState) => state.checkout.step);
  const transactionResult = useSelector((state: RootState) => state.checkout.transactionResult);

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Pasarela de Pagos</h1>
        <p className="text-sm text-gray-600 mt-2">Simulador de pagos integrado con NestJS</p>
      </div>

      {step === 1 && <ProductSelection />}
      {step === 2 && <CustomerPaymentForm />}
      {step === 3 && <CheckoutSummary />}
      {step === 4 && (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6 text-center">
          <h2 className="text-2xl font-bold text-green-600">¡Transacción Exitosa!</h2>
          <p className="text-gray-600">Tu pago ha sido procesado correctamente por la pasarela.</p>
          <div className="p-4 bg-gray-50 rounded-lg text-left font-mono text-sm space-y-1">
            <p><strong>ID Transacción:</strong> {transactionResult?.id}</p>
            <p><strong>Estado:</strong> {transactionResult?.status}</p>
            <p><strong>Referencia:</strong> {transactionResult?.reference}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer"
          >
            Realizar otra compra
          </button>
        </div>
      )}
    </main>
  );
}

export default App;