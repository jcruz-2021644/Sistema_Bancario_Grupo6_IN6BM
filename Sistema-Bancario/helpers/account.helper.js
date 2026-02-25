import Account from '../src/accounts/accounts.model.js';

export const validateMinimumIncome = (income) => {
    if (income === undefined || income === null) {
        throw new Error('El ingreso del usuario es requerido');
    }

    const normalizedIncome = Number(income);

    if (Number.isNaN(normalizedIncome)) {
        throw new Error('El ingreso del usuario no es un numero valido');
    }

    if (normalizedIncome < 100) {
        throw new Error(
            'El usuario no cumple con el ingreso minimo de Q100 para crear una cuenta'
        );
    }

    return true;
};

const ACCOUNT_NUMBER_REGEX = /^[A-Z]{3}-\d{3}-\d{4}$/;

export const generateAccountNumber = () => {
    const firstBlock = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    const secondBlock = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

    return `ACC-${firstBlock}-${secondBlock}`;
};

export const validateUniqueAccountNumber = async (number) => {
    if (!ACCOUNT_NUMBER_REGEX.test(number)) {
        throw new Error('El numero de cuenta debe tener el formato ABC-000-0000');
    }

    const existingAccount = await Account.findOne({ accountNumber: number });

    if (existingAccount) {
        throw new Error('El numero de cuenta ya existe');
    }

    return true;
};

const DPI_REGEX = /^\d{13}$/;
const PHONE_REGEX = /^\d{8}$/;

const hasValue = (value) => value !== undefined && value !== null && `${value}`.trim() !== '';

export const validateAccountHolderData = (accountData, { partial = false } = {}) => {
    const requiredStringFields = [
        { key: 'address', message: 'La direccion es requerida' },
        { key: 'jobName', message: 'El nombre del trabajo es requerido' }
    ];

    for (const field of requiredStringFields) {
        const value = accountData[field.key];

        if (!partial && !hasValue(value)) {
            throw new Error(field.message);
        }

        if (value !== undefined && typeof value !== 'string') {
            throw new Error(`El campo ${field.key} debe ser texto`);
        }
    }

    if (!partial && !hasValue(accountData.dpi)) {
        throw new Error('El DPI es requerido');
    }

    if (accountData.dpi !== undefined && !DPI_REGEX.test(String(accountData.dpi).trim())) {
        throw new Error('El DPI debe tener 13 digitos');
    }

    if (!partial && !hasValue(accountData.phone)) {
        throw new Error('El celular es requerido');
    }

    if (accountData.phone !== undefined && !PHONE_REGEX.test(String(accountData.phone).trim())) {
        throw new Error('El celular debe tener 8 digitos');
    }

    if (!partial && !hasValue(accountData.monthlyIncome)) {
        throw new Error('El ingreso mensual es requerido');
    }

    if (accountData.monthlyIncome !== undefined) {
        const monthlyIncome = Number(accountData.monthlyIncome);

        if (Number.isNaN(monthlyIncome)) {
            throw new Error('El ingreso mensual no es un numero valido');
        }

        if (monthlyIncome < 0) {
            throw new Error('El ingreso mensual no puede ser negativo');
        }
    }

    return true;
};
