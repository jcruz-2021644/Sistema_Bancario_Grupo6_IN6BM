import Account from './accounts.model.js';
import {
    validateMinimumIncome,
    generateAccountNumber,
    validateUniqueAccountNumber,
    validateAccountHolderData
} from '../../helpers/account.helper.js';
import { User } from '../../../Auth-Service/src/users/user.model.js';
import Currency from '../coins/coins.model.js';

const normalizeCurrencyCode = (accountData) => (
    accountData.currencyCode || accountData.currency || accountData.currencyId || ''
).toUpperCase().trim();

const resolveRequesterUserId = (req) => (
    req.user?.sub || req.user?.userId || req.userId || ''
);

const roundToTwoDecimals = (value) => Number(Number(value || 0).toFixed(2));

const validateExistingCurrencyCode = async (currencyCode) => {
    const currency = await Currency.findOne({ code: currencyCode, status: 'activa' });

    if (!currency) {
        throw new Error(`La moneda ${currencyCode} no existe o esta inactiva`);
    }
};

//agregar
export const createAccount = async (req, res) => {
    try {

        const accountData = req.body;
        if (accountData.balance !== undefined) {
            accountData.balance = roundToTwoDecimals(accountData.balance);
        }
        accountData.currencyCode = normalizeCurrencyCode(accountData);
        await validateExistingCurrencyCode(accountData.currencyCode);

        const user = await User.findOne({
            where: { Id: accountData.userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // El nombre y username se obtienen del usuario autenticado/registrado
        accountData.name = user.Name;
        accountData.username = user.Username;

        validateAccountHolderData(accountData);
        validateMinimumIncome(accountData.monthlyIncome);
        accountData.accountNumber = generateAccountNumber();

        let retries = 0;
        const maxRetries = 10;

        while (retries < maxRetries) {
            try {
                await validateUniqueAccountNumber(accountData.accountNumber);
                break;
            } catch (error) {
                if (error.message !== 'El numero de cuenta ya existe') {
                    throw error;
                }

                retries += 1;
                accountData.accountNumber = generateAccountNumber();
            }
        }

        if (retries === maxRetries) {
            throw new Error('No se pudo generar un numero de cuenta unico');
        }

        const account = new Account(accountData);
        await account.save();

        res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente',
            data: account
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getAccounts = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'activa' } = req.query;
        const filter = { status };
        const requesterRole = req.user?.role;
        const requesterUserId = resolveRequesterUserId(req);

        // Solo ADMIN_ROLE puede listar todas las cuentas. Otros roles sólo ven sus propias cuentas.
        if (requesterRole !== 'ADMIN_ROLE') {
            if (!requesterUserId) {
                return res.status(401).json({ success: false, message: 'No autorizado' });
            }
            filter.userId = String(requesterUserId);
        }
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const accounts = await Account.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);
        const total = await Account.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: accounts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las cuentas',
            error: error.message
        })
    }

}
export const updateAccount = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        const accountData = req.body;
        const requesterRole = req.user?.role;
        const requesterUserId = resolveRequesterUserId(req);

        if (requesterRole === 'USER_ROLE') {
            const allowedFieldsForUser = ['name', 'address', 'jobName', 'monthlyIncome'];
            const payloadKeys = Object.keys(accountData);
            const blockedFields = payloadKeys.filter((field) => !allowedFieldsForUser.includes(field));

            if (blockedFields.length > 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Como USER_ROLE solo puedes editar: name, address, jobName, monthlyIncome',
                    blockedFields
                });
            }
        }

        if (accountData.currencyCode || accountData.currency || accountData.currencyId) {
            accountData.currencyCode = normalizeCurrencyCode(accountData);
            await validateExistingCurrencyCode(accountData.currencyCode);
        }

        if (accountData.balance !== undefined) {
            accountData.balance = roundToTwoDecimals(accountData.balance);
        }

        // username no se actualiza desde cliente
        delete accountData.username;

        validateAccountHolderData(accountData, { partial: true });

        if (accountData.monthlyIncome !== undefined) {
            validateMinimumIncome(accountData.monthlyIncome);
        }

        // Si el solicitante es un usuario normal, asegurarse que la cuenta pertenece a él
        if (requesterRole === 'USER_ROLE') {
            const existingAccount = await Account.findOne({ accountNumber });

            if (!existingAccount) {
                return res.status(404).json({
                    success: false,
                    message: 'Cuenta no encontrada'
                });
            }

            if (String(existingAccount.userId) !== String(requesterUserId)) {
                // Intentar obtener una cuenta propia para mostrar en el mensaje, si existe
                const ownAccount = await Account.findOne({ userId: requesterUserId });
                const ownAccountNumber = ownAccount ? ownAccount.accountNumber : 'ACC-000-0000';

                return res.status(403).json({
                    success: false,
                    message: `esta cuenta no te pertenece la tuya es ${ownAccountNumber}`
                });
            }
        }

        const account = await Account.findOneAndUpdate(
            { accountNumber },
            accountData,
            { new: true, runValidators: true }
        );

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cuenta actualizada exitosamente',
            data: account
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar la cuenta',
            error: error.message
        });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { accountNumber } = req.params;

        const account = await Account.findOneAndDelete({ accountNumber });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cuenta eliminada exitosamente'
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al eliminar la cuenta',
            error: error.message
        });
    }
};

export const getAccountByAccountNumber = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        const requesterRole = req.user?.role;
        const requesterUserId = resolveRequesterUserId(req);

        const account = await Account.findOne({ accountNumber });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        if (requesterRole === 'USER_ROLE' && String(account.userId) !== String(requesterUserId)) {
            return res.status(403).json({
                success: false,
                message: 'Esta cuenta no te pertenece'
            });
        }

        res.status(200).json({
            success: true,
            data: account
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar la cuenta',
            error: error.message
        });
    }
};


export const changeAccountStatus = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        const { status } = req.body;

        // Validar estados permitidos
        const allowedStatus = ['activa', 'inactiva', 'bloqueada'];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Estado no permitido'
            });
        }

        const account = await Account.findOneAndUpdate(
            { accountNumber },
            { status },
            { new: true }
        );

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: `Cuenta ${status} correctamente`,
            data: account
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado',
            error: error.message
        });
    }
};
