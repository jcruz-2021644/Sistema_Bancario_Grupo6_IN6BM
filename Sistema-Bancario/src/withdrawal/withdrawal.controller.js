import Withdrawal from './withdrawal.model.js';
import Account from '../accounts/accounts.model.js';
import { validateWithdrawal } from '../../helpers/withdrawal.helper.js';

/**
 * CREAR UN NUEVO RETIRO
 */
export const createWithdrawal = async (req, res) => {
    try {
        const { accountNumber, amount } = req.body;
        // El userId viene del token ya validado (Formato USR-XXXX)
        const userId = req.user.userId; 

        // 1. Validar reglas de negocio (Saldo, Límite Diario, Estado de Cuenta)
        const account = await validateWithdrawal(amount, accountNumber, userId);

        // 2. Crear el registro del retiro
        const withdrawal = new Withdrawal({
            accountNumber,
            amount,
            userId,
            description: `Retiro de cuenta ${accountNumber}`
        });

        // 3. Actualizar el saldo de la cuenta en la base de datos
        // Restamos el monto del balance actual
        await Account.findOneAndUpdate(
            { accountNumber },
            { $inc: { balance: -amount } }
        );

        // 4. Guardar el retiro
        await withdrawal.save();

        res.status(201).json({
            success: true,
            message: 'Retiro realizado exitosamente',
            withdrawal
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'No se pudo procesar el retiro',
            error: error.message
        });
    }
};

/**
 * OBTENER HISTORIAL DE RETIROS (ESTADO DE CUENTA)
 */
export const getAccountStatement = async (req, res) => {
    try {
        const { id: accountNumber } = req.params;
        const userId = req.user.userId;

        // Verificar que la cuenta pertenezca al usuario antes de mostrar historial
        const account = await Account.findOne({ accountNumber, userId });
        
        if (!account) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver el historial de esta cuenta.'
            });
        }

        const history = await Withdrawal.find({ accountNumber }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            accountNumber,
            currentBalance: account.balance,
            history
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el historial',
            error: error.message
        });
    }
};