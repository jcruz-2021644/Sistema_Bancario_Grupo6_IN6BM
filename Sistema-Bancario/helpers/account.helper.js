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
