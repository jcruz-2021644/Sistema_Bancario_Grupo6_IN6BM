import Currency from '../src/coins/coins.model.js';
import Transaction from '../src/transaction/transaction.model.js';


const ACCOUNT_NUMBER_REGEX = /^[A-Z]{3}-\d{3}-\d{4}$/;
//Monto maximo de una trasnferencia
const MAX_TRANSFER_PER_OPERATION = 2000;
//Monto total de trasferencias por un dia
const MAX_TRANSFER_PER_DAY = 10000;

export const normalizeTransactionData = (transactionData) => {
    const normalized = { ...transactionData };

    //Normaliza el numero de la cuenta
    normalized.sourceAccountNumber = (
        normalized.sourceAccountNumber || normalized.sourceAccountId || ''
    ).toUpperCase().trim();

    //Normaliza el numero de la cuenta destino
    normalized.destinationAccountNumber = (
        normalized.destinationAccountNumber || normalized.destinationAccountId || ''
    ).toUpperCase().trim();

    //Normaliza el codigo de la moneda
    normalized.currencyCode = (
        normalized.currencyCode || normalized.currency || normalized.currencyId || ''
    ).toUpperCase().trim();

    normalized.executedByUserId = normalized.executedByUserId || normalized.userId || '';

    return normalized;
};

//validamos que el numero de cuenta tenga el formato correcto
export const validateAccountNumberFormat = (accountNumber, fieldName) => {
    if (!ACCOUNT_NUMBER_REGEX.test(accountNumber)) {
        throw new Error(`${fieldName} debe tener formato ABC-000-0000`);
    }
};

//validamos la moneda de la transaccion y que esta coincida con la moneda de las cuentas
export const validateCurrencyForTransaction = async (currencyCode, sourceAccount, destinationAccount) => {
    const currency = await Currency.findOne({ code: currencyCode, status: 'activa' });

    if (!currency) {
        throw new Error(`La moneda ${currencyCode} no existe o esta inactiva`);
    }

    if (sourceAccount.currencyCode !== currencyCode || destinationAccount.currencyCode !== currencyCode) {
        throw new Error('La moneda de la transaccion no coincide con la moneda de las cuentas');
    }
};

export const validateTransferLimits = async ({ transactionType, sourceAccountNumber, amount, sourceAccount }) => {
    if (transactionType !== 'transferencia') {
        return;
    }

    // Regla 1: una transferencia individual no puede superar Q2000.
    if (amount > MAX_TRANSFER_PER_OPERATION) {
        throw new Error('No puede transferir mas de Q2000 en una sola transaccion');
    }

    // Regla 2: no puede transferir mas que el saldo disponible de su cuenta.
    if (Number(sourceAccount.balance) < amount) {
        throw new Error('No puede transferir mas del saldo actual de la cuenta');
    }

    // Regla 3: total diario acumulado de transferencias no puede superar Q10000.
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [dailyTransfers] = await Transaction.aggregate([
        {
            $match: {
                sourceAccountNumber,
                transactionType: 'transferencia',
                status: 'exitosa',
                transactionDate: { $gte: startOfDay, $lte: endOfDay }
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);

    const transferredToday = Number(dailyTransfers?.totalAmount || 0);
    const totalWithCurrentTransfer = transferredToday + amount;

    if (totalWithCurrentTransfer > MAX_TRANSFER_PER_DAY) {
        throw new Error('No puede transferir mas de Q10000 en un mismo dia');
    }
};

// Aplica los cambios de saldo a las cuentas involucradas en la transaccion
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
