import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedProduct, setStep } from '../store/checkoutSlice';
import type { RootState } from '../store/store.ts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock: number; 
}

export const ProductSelection: React.FC = () => {
  const dispatch = useDispatch();
  const selectedProductId = useSelector((state: RootState) => state.checkout.selectedProductId);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar los productos (permite volver a consultarlos si es necesario)
  const fetchProducts = () => {
    fetch(`${API_URL}/products`)
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
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSelect = (productId: string, stock: number) => {
    // Opcional: si no hay stock, impedir la selección
    if (stock <= 0) return;
    dispatch(setSelectedProduct(productId));
  };

  const handleNext = () => {
    if (selectedProductId) {
      dispatch(setStep(2));
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <p>Cargando productos disponibles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p><strong>No se pudieron cargar los productos:</strong> {error}</p>
        <p style={{ fontSize: '13px', opacity: 0.8 }}>Asegúrate de que el backend de NestJS esté corriendo en el puerto 3000.</p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h2>Selecciona un Producto</h2>
        <p>Elige el servicio o ítem que deseas adquirir a través de la pasarela</p>
      </div>

      <div className="products-grid">
        {products.map((product) => {
          const isSelected = selectedProductId === product.id;
          const isOutOfStock = product.stock <= 0;

          return (
            <div
              key={product.id}
              onClick={() => handleSelect(product.id, product.stock)}
              className={`product-card ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
              style={{ opacity: isOutOfStock ? 0.6 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
            >
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                {/* 2. Añadimos el elemento visual del stock */}
                <span className="product-stock" style={{ display: 'block', fontSize: '12px', marginTop: '6px', fontWeight: 600, color: isOutOfStock ? '#e74c3c' : '#27ae60' }}>
                  {isOutOfStock ? 'Agotado (0 unidades)' : `Disponibles: ${product.stock} un.`}
                </span>
              </div>
              <div className="product-pricing">
                <span className="product-price">
                  ${(product.price / 100).toLocaleString()} {product.currency}
                </span>
                <div className={`radio-indicator ${isSelected ? 'checked' : ''}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="actions-container">
        <button
          onClick={handleNext}
          disabled={!selectedProductId}
          className="primary-btn"
        >
          Continuar con el Pago
        </button>
      </div>
    </div>
  );
};