import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedProduct, setStep } from '../store/checkoutSlice';
import type { RootState } from '../store/store.ts';

interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
}

export const ProductSelection: React.FC = () => {
  const dispatch = useDispatch();
  const selectedProductId = useSelector((state: RootState) => state.checkout.selectedProductId);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Petición al backend de NestJS que configuraste en ProductsModule
    fetch('http://localhost:3000/products')
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar los productos');
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSelect = (productId: string) => {
    dispatch(setSelectedProduct(productId));
  };

  const handleNext = () => {
    if (selectedProductId) {
      dispatch(setStep(2)); // Avanzar al formulario de cliente y tarjeta
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-600 animate-pulse font-medium">Cargando productos disponibles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
        <p>No se pudieron cargar los productos: {error}</p>
        <p className="text-sm mt-1 text-gray-500">Asegúrate de que el backend de NestJS esté corriendo en el puerto 3000.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Selecciona un Producto</h2>
        <p className="text-sm text-gray-500 mt-1">Elige el servicio o ítem que deseas adquirir a través de la pasarela</p>
      </div>

      <div className="grid gap-4">
        {products.map((product) => {
          const isSelected = selectedProductId === product.id;
          return (
            <div
              key={product.id}
              onClick={() => handleSelect(product.id)}
              className={`p-5 border rounded-xl cursor-pointer transition-all duration-200 flex justify-between items-center ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-600/20'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-indigo-600">
                  ${(product.priceInCents / 100).toLocaleString()} {product.currency}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={!selectedProductId}
          className={`px-6 py-3 rounded-lg font-medium text-white transition-all shadow-sm ${
            selectedProductId
              ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Continuar con el Pago
        </button>
      </div>
    </div>
  );
};