import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStep, setTransactionResult } from '../store/checkoutSlice';
import type { RootState } from '../store/store.ts';
import './CheckoutSummary.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}

export const CheckoutSummary: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedProductId, customerData, cardData, deliveryData } = useSelector(
    (state: RootState) => state.checkout,
  );

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_FEE = 2000;
  const DELIVERY_FEE = 5000;

  useEffect(() => {
    if (selectedProductId) {
      fetch(`${API_URL}/products`)
        .then((res) => res.json())
        .then((data: Product[]) => {
          const found = data.find((p) => p.id === selectedProductId);
          if (found) setProduct(found);
        })
        .catch(() =>
          setError('No se pudo cargar la información del producto.'),
        );
    }
  }, [selectedProductId]);

  const productPrice = product ? Number(product.price) / 100 : 0;
  const totalAmount = productPrice + BASE_FEE + DELIVERY_FEE;

  const handlePay = async () => {
    if (!product || !selectedProductId || !customerData || !cardData) {
      setError('Faltan datos en la orden para procesar el pago.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        productId: selectedProductId,
        customerData: {
          email: customerData.email,
          fullName: customerData.fullName,
        },
        cardData: {
          cardNumber: cardData.cardNumber,
          cardHolder: cardData.cardHolder,
          expiry: cardData.expiry,
          cvc: cardData.cvc,
          token: cardData.token,
          installments: Number(cardData.installments) || 1,
        },
        deliveryData: {
          address: deliveryData?.address || 'Calle Falsa 123',
          city: deliveryData?.city || 'Cali',
        },
      };

      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errRes = await response.json();
        throw new Error(
          errRes.message
            ? Array.isArray(errRes.message)
              ? errRes.message.join(', ')
              : errRes.message
            : 'Error al procesar la transacción en el servidor.',
        );
      }

      const result = await response.json();

      dispatch(setTransactionResult(result));
      dispatch(setStep(4));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado al procesar el pago.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    dispatch(setStep(2));
  };

  return (
    <div className="checkout-summary-container">
      <div className="checkout-summary-header">
        <h2 className="checkout-summary-title">Resumen de tu Orden</h2>
        <p className="checkout-summary-subtitle">
          Verifica los datos y costos antes de confirmar el pago
        </p>
      </div>

      {error && <div className="checkout-summary-error-alert">⚠️ {error}</div>}

      <div className="checkout-summary-sections-container">
        <div className="checkout-summary-card-box">
          <h3 className="checkout-summary-section-label">Producto Seleccionado</h3>
          {product ? (
            <div className="checkout-summary-row-between">
              <div>
                <p className="checkout-summary-product-name">{product.name}</p>
                <p className="checkout-summary-product-desc">{product.description}</p>
              </div>
            </div>
          ) : (
            <p className="checkout-summary-muted-text">Cargando producto...</p>
          )}
        </div>

        <div className="checkout-summary-card-box">
          <h3 className="checkout-summary-section-label">Datos del Cliente</h3>
          <p className="checkout-summary-bold-text">{customerData?.fullName}</p>
          <p className="checkout-summary-muted-text">{customerData?.email}</p>
        </div>

        <div className="checkout-summary-card-box">
          <h3 className="checkout-summary-section-label">Datos de Envío</h3>
          <p className="checkout-summary-bold-text">Dirección: {deliveryData?.address || 'No especificada'}</p>
          <p className="checkout-summary-muted-text">Ciudad: {deliveryData?.city || 'No especificada'}</p>
        </div>

        <div className="checkout-summary-card-box">
          <h3 className="checkout-summary-section-label">Método de Pago</h3>
          <p className="checkout-summary-bold-text">
            Tarjeta terminada en {cardData?.cardNumber ? cardData.cardNumber.slice(-4) : '****'}
          </p>
          <p className="checkout-summary-muted-text">
            Cuotas seleccionadas: {cardData?.installments || 1}
          </p>
        </div>

        <div className="checkout-summary-summary-card-box">
          <h3 className="checkout-summary-section-label">Desglose de Pago</h3>
          
          <div className="checkout-summary-row-between">
            <span className="checkout-summary-muted-text">Precio del Producto:</span>
            <span className="checkout-summary-bold-text">
              ${productPrice.toLocaleString()} {product?.currency}
            </span>
          </div>

          <div className="checkout-summary-row-between">
            <span className="checkout-summary-muted-text">Tarifa Base:</span>
            <span className="checkout-summary-bold-text">${BASE_FEE.toLocaleString()}</span>
          </div>

          <div className="checkout-summary-row-between">
            <span className="checkout-summary-muted-text">Tarifa de Envío:</span>
            <span className="checkout-summary-bold-text">${DELIVERY_FEE.toLocaleString()}</span>
          </div>

          <div className="checkout-summary-divider" />

          <div className="checkout-summary-row-between">
            <span className="checkout-summary-total-label">Total a Pagar:</span>
            <span className="checkout-summary-total-price">
              ${totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="checkout-summary-button-container">
        <button
          type="button"
          onClick={handleBack}
          disabled={loading}
          className="checkout-summary-back-button"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="checkout-summary-primary-button"
          style={{
            backgroundColor: loading ? '#818cf8' : '#4f46e5',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Procesando Pago...' : 'Confirmar y Pagar'}
        </button>
      </div>
    </div>
  );
};