import Currency from '../src/coins/coins.model.js';

const ACCOUNT_NUMBER_REGEX = /^[A-Z]{3}-\d{3}-\d{4}$/;

export const normalizeTransactionData = (transactionData) => {
    const normalized = { ...transactionData };

    normalized.sourceAccountNumber = (
        normalized.sourceAccountNumber || normalized.sourceAccountId || ''
    ).toUpperCase().trim();

    normalized.destinationAccountNumber = (
        normalized.destinationAccountNumber || normalized.destinationAccountId || ''
    ).toUpperCase().trim();

    normalized.currencyCode = (
        normalized.currencyCode || normalized.currency || normalized.currencyId || ''
    ).toUpperCase().trim();

    normalized.executedByUserId = normalized.executedByUserId || normalized.userId || '';

    return normalized;
};

export const validateAccountNumberFormat = (accountNumber, fieldName) => {
    if (!ACCOUNT_NUMBER_REGEX.test(accountNumber)) {
        throw new Error(`${fieldName} debe tener formato ABC-000-0000`);
    }
};

export const validateCurrencyForTransaction = async (currencyCode, sourceAccount, destinationAccount) => {
    const currency = await Currency.findOne({ code: currencyCode, status: 'activa' });

    if (!currency) {
        throw new Error(`La moneda ${currencyCode} no existe o esta inactiva`);
    }

    if (sourceAccount.currencyCode !== currencyCode || destinationAccount.currencyCode !== currencyCode) {
        throw new Error('La moneda de la transaccion no coincide con la moneda de las cuentas');
    }
};

export const applyTransactionBalances = ({ transactionType, amount, sourceAccount, destinationAccount }) => {
    if (amount <= 0) {
        throw new Error('El monto debe ser mayor a 0');
    }

    if (transactionType === 'deposito') {
        const previousBalance = destinationAccount.balance;
        destinationAccount.balance += amount;

        return { previousBalance, newBalance: destinationAccount.balance };
    }

    const sourceBalanceBefore = sourceAccount.balance;

    if (sourceBalanceBefore < amount) {
        throw new Error('Saldo insuficiente en la cuenta origen');
    }

    sourceAccount.balance -= amount;

    if (['transferencia', 'pago_servicio', 'pago_prestamo'].includes(transactionType)) {
        destinationAccount.balance += amount;
    }

    return { previousBalance: sourceBalanceBefore, newBalance: sourceAccount.balance };
};
