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
