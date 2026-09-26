import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCustomerData, setCardData, setStep } from '../store/checkoutSlice';
import type { RootState } from '../store/store.ts';

export const CustomerPaymentForm: React.FC = () => {
  const dispatch = useDispatch();
  const currentCustomer = useSelector((state: RootState) => state.checkout.customerData);
  const currentCard = useSelector((state: RootState) => state.checkout.cardData);

  // Estados locales para el formulario del cliente
  const [fullName, setFullName] = useState(currentCustomer?.fullName || '');
  const [email, setEmail] = useState(currentCustomer?.email || '');

  // Estados locales para la tarjeta (simulada)
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [installments, setInstallments] = useState(currentCard?.installments || 1);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!fullName.trim() || !email.trim()) {
      setError('Por favor completa todos los datos del cliente.');
      return;
    }

    if (!cardNumber || !cardHolder || !expiry || !cvc) {
      setError('Por favor completa los datos de la tarjeta.');
      return;
    }

    setError(null);

    // Guardar datos del cliente en Redux
    dispatch(setCustomerData({ fullName, email }));

    // Simular un token de tarjeta y guardar en Redux
    // (En una integración real con pasarela, aquí iría la llamada al tokenizador)
    const simulatedToken = `tok_simulated_${Math.random().toString(36).substring(2, 9)}`;
    dispatch(setCardData({ token: simulatedToken, installments }));

    // Avanzar al siguiente paso (Resumen / Envío)
    dispatch(setStep(3));
  };

  const handleBack = () => {
    dispatch(setStep(1));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Datos de Facturación y Pago</h2>
        <p className="text-sm text-gray-500 mt-1">Ingresa tu información personal y los detalles de tu tarjeta</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección: Datos del Cliente */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">1. Información del Cliente</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Heberth Vargas"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Sección: Datos de la Tarjeta */}
        <div className="space-y-4 pt-2">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">2. Datos de la Tarjeta</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta</label>
            <input
              type="text"
              maxLength={16}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4000 0000 0000 0000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titular de la Tarjeta</label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="COMO APARECE EN LA TARJETA"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiración (MM/AA)</label>
              <input
                type="text"
                maxLength={5}
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/AA"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-center"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVC / CVV</label>
              <input
                type="password"
                maxLength={4}
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-center"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuotas / Installments</label>
            <select
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              {[1, 2, 3, 6, 12].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Cuota' : 'Cuotas'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones de Navegación */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
          >
            Volver
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
          >
            Revisar Resumen
          </button>
        </div>
      </form>
    </div>
  );
};