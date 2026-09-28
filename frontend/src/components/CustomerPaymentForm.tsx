import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCustomerData, setCardData, setDeliveryData, setStep } from '../store/checkoutSlice';
import type { RootState } from '../store/store.ts';
import './CustomerPaymentForm.css';

export const CustomerPaymentForm: React.FC = () => {
  const dispatch = useDispatch();
  const currentCustomer = useSelector((state: RootState) => state.checkout.customerData);
  const currentCard = useSelector((state: RootState) => state.checkout.cardData);
  const currentDelivery = useSelector((state: RootState) => state.checkout.deliveryData);

  const [fullName, setFullName] = useState(currentCustomer?.fullName || '');
  const [email, setEmail] = useState(currentCustomer?.email || '');

  const [cardNumber, setCardNumber] = useState(currentCard?.cardNumber || '');
  const [cardHolder, setCardHolder] = useState(currentCard?.cardHolder || '');
  const [expiry, setExpiry] = useState(currentCard?.expiry || '');
  const [cvc, setCvc] = useState(currentCard?.cvc || '');
  const [installments, setInstallments] = useState(currentCard?.installments || 1);

  const [address, setAddress] = useState(currentDelivery?.address || '');
  const [city, setCity] = useState(currentDelivery?.city || '');

  const [error, setError] = useState<string | null>(null);

  const updateCardInRedux = (num: string, holder: string, exp: string, code: string, inst: number) => {
    const simulatedToken = currentCard?.token || `tok_simulated_${Math.random().toString(36).substring(2, 9)}`;
    dispatch(
      setCardData({
        cardNumber: num,
        cardHolder: holder,
        expiry: exp,
        cvc: code,
        token: simulatedToken,
        installments: inst,
      })
    );
  };

  const handleFullNameChange = (value: string) => {
    const sanitized = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    setFullName(sanitized);
    dispatch(setCustomerData({ fullName: sanitized, email }));
  };

  const handleEmailChange = (value: string) => {
    let sanitized = value.replace(/[^a-zA-Z0-9._@+-]/g, '');
    const parts = sanitized.split('@');
    if (parts.length > 2) {
      sanitized = parts[0] + '@' + parts.slice(1).join('');
    }
    sanitized = sanitized.replace(/\.\./g, '.');
    setEmail(sanitized);
    dispatch(setCustomerData({ fullName, email: sanitized }));
  };

  const handleCardNumberChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(digitsOnly);
    updateCardInRedux(digitsOnly, cardHolder, expiry, cvc, installments);
  };

  const handleCardHolderChange = (value: string) => {
    const sanitized = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').toUpperCase();
    setCardHolder(sanitized);
    updateCardInRedux(cardNumber, sanitized, expiry, cvc, installments);
  };

  const handleExpiryChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
    if (digitsOnly.length >= 1 && parseInt(digitsOnly[0], 10) > 1) return;
    if (digitsOnly.length >= 2) {
      const monthNum = parseInt(digitsOnly.slice(0, 2), 10);
      if (monthNum < 1 || monthNum > 12) return;
    }
    let formatted = digitsOnly;
    if (digitsOnly.length >= 3) {
      formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
    } else if (digitsOnly.length >= 2) {
      formatted = `${digitsOnly}/`;
    }
    setExpiry(formatted);
    updateCardInRedux(cardNumber, cardHolder, formatted, cvc, installments);
  };

  const handleCvcChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
    setCvc(digitsOnly);
    updateCardInRedux(cardNumber, cardHolder, expiry, digitsOnly, installments);
  };

  const handleInstallmentsChange = (value: number) => {
    setInstallments(value);
    updateCardInRedux(cardNumber, cardHolder, expiry, cvc, value);
  };

  const handleCityChange = (value: string) => {
    const sanitized = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    setCity(sanitized);
    dispatch(setDeliveryData({ address, city: sanitized }));
  };

  const handleAddressChange = (value: string) => {
    const sanitized = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ#\-/°.,\s]/g, '');
    setAddress(sanitized);
    dispatch(setDeliveryData({ address: sanitized, city }));
  };

  const validateEmail = (emailStr: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(emailStr.trim());
  };

  const validateExpiryDate = (expiryStr: string) => {
    if (expiryStr.length !== 5) return false;
    const [monthStr, yearStr] = expiryStr.split('/');
    const month = parseInt(monthStr, 10);
    const year = parseInt(`20${yearStr}`, 10);
    if (isNaN(month) || month < 1 || month > 12) return false;
    if (isNaN(year)) return false;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }
    return true;
  };

  const handleProceedToSummary = () => {
    if (!fullName.trim() || !email.trim()) {
      setError('Por favor completa todos los datos del cliente.');
      return false;
    }
    if (!validateEmail(email)) {
      setError('Por favor ingresa un correo electrónico válido.');
      return false;
    }
    if (!address.trim() || address.trim().length < 5) {
      setError('Por favor ingresa una dirección de envío válida (mínimo 5 caracteres).');
      return false;
    }
    if (!city.trim() || city.trim().length < 2) {
      setError('Por favor ingresa una ciudad válida.');
      return false;
    }
    if (cardNumber.length < 13 || cardNumber.length > 16) {
      setError('El número de tarjeta debe tener entre 13 y 16 dígitos.');
      return false;
    }
    if (!cardHolder.trim()) {
      setError('Por favor ingresa el titular de la tarjeta.');
      return false;
    }
    if (!validateExpiryDate(expiry)) {
      setError('Fecha de expiración inválida o tarjeta vencida.');
      return false;
    }
    if (cvc.length < 3) {
      setError('El código CVC/CVV debe tener al menos 3 dígitos.');
      return false;
    }

    setError(null);
    dispatch(setCustomerData({ fullName, email }));
    dispatch(setDeliveryData({ address, city }));
    updateCardInRedux(cardNumber, cardHolder, expiry, cvc, installments);
    dispatch(setStep(3));
    return true;
  };

  const handleGoBack = () => {
    dispatch(setStep(1));
  };

  return (
    <div className="customer-form-container">
      <div className="customer-form-header">
        <h2 className="customer-form-title">Datos de Cliente, Envío y Pago</h2>
        <p className="customer-form-subtitle">Completa tu información para procesar la transacción</p>
      </div>

      {error && <div className="customer-form-error-alert">⚠️ {error}</div>}

      <div className="customer-form-section">
        <div className="customer-form-section-group">
          <h3 className="customer-form-section-title">1. Información del Cliente</h3>
          <div className="customer-form-input-group">
            <label className="customer-form-label">Nombre Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => handleFullNameChange(e.target.value)}
              placeholder="Ej. Heberth Vargas"
              className="customer-form-input"
            />
          </div>
          <div className="customer-form-input-group">
            <label className="customer-form-label">Correo Electrónico</label>
            <input
              type="text"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="customer-form-input"
            />
          </div>
        </div>

        <div className="customer-form-section-group">
          <h3 className="customer-form-section-title">2. Dirección de Envío</h3>
          <div className="customer-form-input-group">
            <label className="customer-form-label">Dirección</label>
            <input
              type="text"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="Ej. Calle 100 # 50-20"
              className="customer-form-input"
            />
          </div>
          <div className="customer-form-input-group">
            <label className="customer-form-label">Ciudad</label>
            <input
              type="text"
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              placeholder="Ej. Cali"
              className="customer-form-input"
            />
          </div>
        </div>

        <div className="customer-form-section-group">
          <h3 className="customer-form-section-title">3. Datos de la Tarjeta</h3>
          <div className="customer-form-input-group">
            <label className="customer-form-label">Número de Tarjeta</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={16}
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              placeholder="4000000000000000"
              className="customer-form-input customer-form-input-mono"
            />
          </div>
          <div className="customer-form-input-group">
            <label className="customer-form-label">Titular de la Tarjeta</label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => handleCardHolderChange(e.target.value)}
              placeholder="COMO APARECE EN LA TARJETA"
              className="customer-form-input customer-form-input-uppercase"
            />
          </div>
          <div className="customer-form-row-grid">
            <div className="customer-form-input-group">
              <label className="customer-form-label">Expiración (MM/AA)</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={expiry}
                onChange={(e) => handleExpiryChange(e.target.value)}
                placeholder="MM/AA"
                className="customer-form-input customer-form-input-mono customer-form-input-center"
              />
            </div>
            <div className="customer-form-input-group">
              <label className="customer-form-label">CVC / CVV</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={cvc}
                onChange={(e) => handleCvcChange(e.target.value)}
                placeholder="123"
                className="customer-form-input customer-form-input-mono customer-form-input-center"
              />
            </div>
          </div>
          <div className="customer-form-input-group">
            <label className="customer-form-label">Cuotas</label>
            <select
              value={installments}
              onChange={(e) => handleInstallmentsChange(Number(e.target.value))}
              className="customer-form-input"
            >
              {[1, 2, 3, 6, 12].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Cuota' : 'Cuotas'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="customer-form-button-container">
          <button type="button" onClick={handleGoBack} className="customer-form-back-button">
            Volver
          </button>
          <button type="button" onClick={handleProceedToSummary} className="customer-form-primary-button">
            Continuar con el Pago
          </button>
        </div>
      </div>
    </div>
  );
};