import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStep, setTransactionResult } from '../store/checkoutSlice';
import type { RootState } from '../store/store.ts';

interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
}

export const CheckoutSummary: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedProductId, customerData, cardData } = useSelector(
    (state: RootState) => state.checkout
  );

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener la información completa del producto seleccionado para mostrarla en el resumen
  useEffect(() => {
    if (selectedProductId) {
      fetch('http://localhost:3000/products')
        .then((res) => res.json())
        .then((data: Product[]) => {
          const found = data.find((p) => p.id === selectedProductId);
          if (found) setProduct(found);
        })
        .catch(() => setError('No se pudo cargar la información del producto.'));
    }
  }, [selectedProductId]);

  const handlePay = async () => {
    if (!product || !customerData || !cardData) {
      setError('Faltan datos en la orden para procesar el pago.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Estructura que espera tu CreateTransactionDto en el backend
      const payload = {
        amountInCents: product.priceInCents,
        currency: product.currency,
        customerEmail: customerData.email,
        paymentMethod: {
          type: 'CARD',
          installments: cardData.installments,
          token: cardData.token,
        },
        reference: `ORDER-${Date.now()}`,
      };

      const response = await fetch('http://localhost:3000/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al procesar la transacción en el servidor.');
      }

      const result = await response.json();

      // Guardar resultado y avanzar al paso de éxito/resultado (Paso 4)
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Resumen de tu Orden</h2>
        <p className="text-sm text-gray-500 mt-1">Verifica los datos antes de confirmar el pago</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Detalle del Producto */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Producto Seleccionado</h3>
          {product ? (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
              <span className="font-bold text-indigo-600 text-lg">
                ${(product.priceInCents / 100).toLocaleString()} {product.currency}
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Cargando producto...</p>
          )}
        </div>

        {/* Detalle del Cliente */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Datos del Cliente</h3>
          <p className="text-gray-900 font-medium">{customerData?.fullName}</p>
          <p className="text-sm text-gray-600">{customerData?.email}</p>
        </div>

        {/* Detalle del Pago */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Método de Pago</h3>
          <p className="text-gray-900 font-medium">Tarjeta de Crédito / Débito</p>
          <p className="text-sm text-gray-600">Cuotas seleccionadas: {cardData?.installments}</p>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={handleBack}
          disabled={loading}
          className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-medium text-white transition-all shadow-sm ${
            loading
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
          }`}
        >
          {loading ? 'Procesando Pago...' : 'Confirmar y Pagar'}
        </button>
      </div>
    </div>
  );
};