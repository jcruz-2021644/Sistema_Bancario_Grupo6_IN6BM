import Transaction from './transaction.model.js';
import Account from '../accounts/accounts.model.js';
import {
    normalizeTransactionData,
    validateAccountNumberFormat,
    validateCurrencyForTransaction,
    applyTransactionBalances
} from '../../helpers/transaction.helper.js';

//agregar
export const createTransaction = async (req, res) => {
    try {

        const transactionData = normalizeTransactionData(req.body);
        const { sourceAccountNumber, destinationAccountNumber } = transactionData;

        validateAccountNumberFormat(sourceAccountNumber, 'sourceAccountNumber');
        validateAccountNumberFormat(destinationAccountNumber, 'destinationAccountNumber');

        if (!transactionData.executedByUserId) {
            throw new Error('El usuario que ejecuta la transaccion es requerido');
        }

        if (sourceAccountNumber === destinationAccountNumber && transactionData.transactionType === 'transferencia') {
            throw new Error('La cuenta origen y destino no pueden ser la misma en una transferencia');
        }

        const [sourceAccount, destinationAccount] = await Promise.all([
            Account.findOne({ accountNumber: sourceAccountNumber }),
            Account.findOne({ accountNumber: destinationAccountNumber })
        ]);

        if (!sourceAccount || !destinationAccount) {
            return res.status(404).json({
                success: false,
                message: 'Una o ambas cuentas no existen'
            });
        }

        await validateCurrencyForTransaction(transactionData.currencyCode, sourceAccount, destinationAccount);

        const { previousBalance, newBalance } = applyTransactionBalances({
            transactionType: transactionData.transactionType,
            amount: Number(transactionData.amount),
            sourceAccount,
            destinationAccount
        });

        transactionData.previousBalance = previousBalance;
        transactionData.newBalance = newBalance;

        await Promise.all([
            sourceAccount.save(),
            destinationAccount.save()
        ]);

        const transaction = new Transaction(transactionData);
        await transaction.save();

        res.status(201).json({
            success: true,
            message: 'Transacción creada exitosamente',
            data: transaction
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la transacción',
            error: error.message
        })
    }
}

export const getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'exitosa' } = req.query;
        const filter = { status };
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const transactions = await Transaction.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);
        const total = await Transaction.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: transactions,
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
            message: 'Error al obtener las transacciones',    
            error: error.message
        })
    }

}

export const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transactionData = req.body;
        const transaction = await Transaction.findByIdAndUpdate(
            id,
            transactionData,
            { new: true, runValidators: true }
        );
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Transacción actualizada exitosamente',
            data: transaction
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar la transacción',
            error: error.message
        });
    }
}

export const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findByIdAndDelete(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            })
        }
        
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al eliminar la transacción',
            error: error.message
        })
    }
}

export const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: transaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar la transacción',
            error: error.message
        });
    }
};