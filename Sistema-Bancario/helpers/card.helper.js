import Card from '../src/card/cards.model.js';

export const generateCardNumber = () => {
    // numero fico y se le agregan 10 digitos aleatorios para completar el numero de tarjeta
    const bin = '453201';
    const randomPart = String(Math.floor(Math.random() * 10 ** 10)).padStart(10, '0');
    return `${bin}${randomPart}`;
};

export const validateUniqueCardNumber = async (cardNumber) => {
    const exists = await Card.findOne({ cardNumber });
    if (exists) throw new Error('El numero de tarjeta ya existe');
    return true;
};

export const getUniqueCardNumber = async (maxRetries = 10) => {
    let retries = 0;

    while (retries < maxRetries) {
        const candidate = generateCardNumber();

        try {
            await validateUniqueCardNumber(candidate);
            return candidate;
        } catch (error) {
            if (error.message !== 'El numero de tarjeta ya existe') {
                throw error;
            }

            retries += 1;
        }
    }

    throw new Error('No se pudo generar un numero de tarjeta unico');
};
