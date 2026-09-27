import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStep, setTransactionResult } from '../store/checkoutSlice';
import type { RootState } from '../store/store.ts';

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

  useEffect(() => {
    if (selectedProductId) {
      fetch('http://localhost:3000/products')
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

  const handlePay = async () => {
    if (!product || !selectedProductId || !customerData || !cardData) {
      setError('Faltan datos en la orden para procesar el pago.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Estructura completa alineada estrictamente al CreateTransactionDto del backend
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

      const response = await fetch('http://localhost:3000/transactions', {
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
      dispatch(setStep(4)); // Avanzar a la pantalla de resultado
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
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Resumen de tu Orden</h2>
        <p style={styles.subtitle}>
          Verifica los datos antes de confirmar el pago
        </p>
      </div>

      {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

      <div style={styles.sectionsContainer}>
        {/* Detalle del Producto */}
        <div style={styles.cardBox}>
          <h3 style={styles.sectionLabel}>Producto Seleccionado</h3>
          {product ? (
            <div style={styles.rowBetween}>
              <div>
                <p style={styles.productName}>{product.name}</p>
                <p style={styles.productDesc}>{product.description}</p>
              </div>
              <span style={styles.productPrice}>
                ${(product.price / 100).toLocaleString()} {product.currency}
              </span>
            </div>
          ) : (
            <p style={styles.mutedText}>Cargando producto...</p>
          )}
        </div>

        {/* Detalle del Cliente */}
        <div style={styles.cardBox}>
          <h3 style={styles.sectionLabel}>Datos del Cliente</h3>
          <p style={styles.boldText}>{customerData?.fullName}</p>
          <p style={styles.mutedText}>{customerData?.email}</p>
        </div>

        {/* Detalle de Envío */}
        <div style={styles.cardBox}>
          <h3 style={styles.sectionLabel}>Datos de Envío</h3>
          <p style={styles.boldText}>Dirección: {deliveryData?.address || 'No especificada'}</p>
          <p style={styles.mutedText}>Ciudad: {deliveryData?.city || 'No especificada'}</p>
        </div>

        {/* Detalle del Pago */}
        <div style={styles.cardBox}>
          <h3 style={styles.sectionLabel}>Método de Pago</h3>
          <p style={styles.boldText}>Tarjeta terminada en {cardData?.cardNumber ? cardData.cardNumber.slice(-4) : '****'}</p>
          <p style={styles.mutedText}>
            Cuotas seleccionadas: {cardData?.installments}
          </p>
        </div>
      </div>

      {/* Botones de Acción */}
      <div style={styles.buttonContainer}>
        <button
          type="button"
          onClick={handleBack}
          disabled={loading}
          style={styles.backButton}
        >
          Volver
        </button>
        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          style={{
            ...styles.primaryButton,
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

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '520px',
    width: '100%',
    margin: '24px auto',
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1a1a1a',
    margin: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: '#666666',
    marginTop: '6px',
  },
  errorAlert: {
    padding: '10px 14px',
    backgroundColor: '#fdf2f2',
    border: '1px solid #f8d7da',
    borderRadius: '8px',
    color: '#a94442',
    fontSize: '13px',
    fontWeight: 500,
    textAlign: 'center',
    marginBottom: '16px',
  },
  sectionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cardBox: {
    padding: '14px 16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sectionLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
    marginBottom: '4px',
  },
  rowBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  productName: {
    fontWeight: 600,
    color: '#111827',
    margin: 0,
  },
  productDesc: {
    fontSize: '13px',
    color: '#4b5563',
    margin: 0,
    marginTop: '2px',
  },
  productPrice: {
    fontWeight: 700,
    color: '#4f46e5',
    fontSize: '16px',
  },
  boldText: {
    fontWeight: 500,
    color: '#111827',
    margin: 0,
  },
  mutedText: {
    fontSize: '13px',
    color: '#4b5563',
    margin: 0,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #eaeaea',
  },
  backButton: {
    flex: '1',
    padding: '12px 16px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '14px',
    color: '#4b5563',
    backgroundColor: '#f3f4f6',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center',
  },
  primaryButton: {
    flex: '2',
    padding: '12px 16px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '14px',
    color: '#ffffff',
    border: 'none',
    textAlign: 'center',
  },
};