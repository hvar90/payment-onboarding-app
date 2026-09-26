import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCustomerData, setCardData, setStep } from '../store/checkoutSlice';
import type { RootState } from '../store/store.ts';

export const CustomerPaymentForm: React.FC = () => {
  const dispatch = useDispatch();
  const currentCustomer = useSelector((state: RootState) => state.checkout.customerData);
  const currentCard = useSelector((state: RootState) => state.checkout.cardData);

  const [fullName, setFullName] = useState(currentCustomer?.fullName || '');
  const [email, setEmail] = useState(currentCustomer?.email || '');

  const [cardNumber, setCardNumber] = useState(currentCard?.cardNumber || '');
  const [cardHolder, setCardHolder] = useState(currentCard?.cardHolder || '');
  const [expiry, setExpiry] = useState(currentCard?.expiry || '');
  const [cvc, setCvc] = useState(currentCard?.cvc || '');
  const [installments, setInstallments] = useState(currentCard?.installments || 1);

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

  // Sanitiza el email: solo caracteres permitidos, máximo una arroba y evita puntos dobles seguidos
  const handleEmailChange = (value: string) => {
    let sanitized = value.replace(/[^a-zA-Z0-9._@+-]/g, '');
    
    // Controla que solo pueda haber un '@'
    const parts = sanitized.split('@');
    if (parts.length > 2) {
      sanitized = parts[0] + '@' + parts.slice(1).join('');
    }

    // Evita puntos consecutivos (ej: '..')
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

  // Validación robusta de correo: exige usuario, arroba, dominio válido y extensión de al menos 2 letras
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
      setError('Por favor ingresa un correo electrónico válido (ejemplo: usuario@dominio.com).');
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
      setError('Fecha de expiración inválida (Mes entre 01 y 12, tarjeta vigente).');
      return false;
    }
    if (cvc.length < 3) {
      setError('El código CVC/CVV debe tener al menos 3 dígitos.');
      return false;
    }

    setError(null);
    dispatch(setCustomerData({ fullName, email }));
    updateCardInRedux(cardNumber, cardHolder, expiry, cvc, installments);
    dispatch(setStep(3));
    return true;
  };

  const handleGoBack = () => {
    dispatch(setStep(1));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Datos de Facturación y Pago</h2>
        <p style={styles.subtitle}>Ingresa tu información personal y los detalles de tu tarjeta</p>
      </div>

      {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

      <div style={styles.formSection}>
        {/* Sección 1: Información del Cliente */}
        <div style={styles.sectionGroup}>
          <h3 style={styles.sectionTitle}>1. Información del Cliente</h3>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => handleFullNameChange(e.target.value)}
              placeholder="Ej. Heberth Vargas"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              type="text"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="correo@ejemplo.com"
              style={styles.input}
            />
          </div>
        </div>

        {/* Sección 2: Datos de la Tarjeta */}
        <div style={styles.sectionGroup}>
          <h3 style={styles.sectionTitle}>2. Datos de la Tarjeta</h3>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Número de Tarjeta</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={16}
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              placeholder="4000000000000000"
              style={{ ...styles.input, fontFamily: 'monospace' }}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Titular de la Tarjeta</label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => handleCardHolderChange(e.target.value)}
              placeholder="COMO APARECE EN LA TARJETA"
              style={{ ...styles.input, textTransform: 'uppercase' }}
            />
          </div>

          <div style={styles.rowGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Expiración (MM/AA)</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={expiry}
                onChange={(e) => handleExpiryChange(e.target.value)}
                placeholder="MM/AA"
                style={{ ...styles.input, fontFamily: 'monospace', textAlign: 'center' }}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>CVC / CVV</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={cvc}
                onChange={(e) => handleCvcChange(e.target.value)}
                placeholder="123"
                style={{ ...styles.input, fontFamily: 'monospace', textAlign: 'center' }}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Cuotas</label>
            <select
              value={installments}
              onChange={(e) => handleInstallmentsChange(Number(e.target.value))}
              style={styles.input}
            >
              {[1, 2, 3, 6, 12].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Cuota' : 'Cuotas'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones de Navegación con Flexbox Puro */}
        <div style={styles.buttonContainer}>
          <button type="button" onClick={handleGoBack} style={styles.backButton}>
            Volver
          </button>
          <button type="button" onClick={handleProceedToSummary} style={styles.primaryButton}>
            Continuar con el Pago (Wompi)
          </button>
        </div>
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
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#333333',
    borderBottom: '1px solid #eaeaea',
    paddingBottom: '8px',
    margin: 0,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#444444',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1f2937',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
  },
  rowGrid: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    width: '100%',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #eaeaea',
    width: '100%',
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
    backgroundColor: '#4f46e5',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center',
  },
};