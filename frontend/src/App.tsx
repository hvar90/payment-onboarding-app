import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "./store/store";
import { resetCheckout } from "./store/checkoutSlice";
import { ProductSelection } from "./components/ProductSelection";
import { CustomerPaymentForm } from "./components/CustomerPaymentForm";
import { CheckoutSummary } from "./components/CheckoutSummary";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  const step = useSelector((state: RootState) => state.checkout.step);
  const transactionResult = useSelector(
    (state: RootState) => state.checkout.transactionResult,
  );

  const handleReturnToStore = () => {
    dispatch(resetCheckout());
  };

  return (
    <main className="main-container">
      <div className="app-header">
        <h1 className="main-title">Pasarela de Pagos</h1>
        <p className="main-subtitle">
          Plataforma global de procesamiento de pagos y transacciones en línea
        </p>
      </div>

      {step === 1 && <ProductSelection />}
      {step === 2 && <CustomerPaymentForm />}
      {step === 3 && <CheckoutSummary />}
      {step === 4 && (
        <div className="success-container">
          <h2 className="success-title">¡Transacción Exitosa!</h2>
          <p className="success-text">
            Tu pago ha sido procesado correctamente por la pasarela.
          </p>
          <div className="result-box">
            <p>
              <strong>ID Transacción:</strong> {transactionResult?.gatewayId}
            </p>
            <p>
              <strong>Estado:</strong> {transactionResult?.status}
            </p>
            <p>
              <strong>Referencia:</strong> {transactionResult?.reference}
            </p>
          </div>
          <button onClick={handleReturnToStore} className="success-button">
            Volver al inicio (Ver stock actualizado)
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
