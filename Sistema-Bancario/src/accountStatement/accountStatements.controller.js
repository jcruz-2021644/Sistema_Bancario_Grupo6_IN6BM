import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import AccountStatement from './accountStatements.model.js';
import Account from '../accounts/accounts.model.js';
import Transaction from '../transaction/transaction.model.js';
import {
    buildStatementSummary,
    generateStatementPdf          
} from '../../helpers/accountStatement.helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATEMENTS_DIR = path.resolve(__dirname, '../../storage/account-statements');

const ensureStatementsDir = () => {
    if (!fs.existsSync(STATEMENTS_DIR)) {
        fs.mkdirSync(STATEMENTS_DIR, { recursive: true });
    }
};

const resolveAccountByCode = async (accountNumber) => {
    const normalized = String(accountNumber || '').toUpperCase().trim();
    return Account.findOne({ accountNumber: normalized });
};

const parseDateRange = (query) => {
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodStart = query.periodStart ? new Date(query.periodStart) : defaultStart;
    const periodEnd   = query.periodEnd   ? new Date(query.periodEnd)   : now;

    if (Number.isNaN(periodStart.getTime()) || Number.isNaN(periodEnd.getTime())) {
        throw new Error('periodStart y periodEnd deben ser fechas validas');
    }
    if (periodStart > periodEnd) {
        throw new Error('periodStart no puede ser mayor que periodEnd');
    }

    return { periodStart, periodEnd };
};

export const createAccountStatement = async (req, res) => {
    try {
        const accountStatementData = req.body;

        if (accountStatementData.accountNumber && !accountStatementData.accountId) {
            const account = await resolveAccountByCode(accountStatementData.accountNumber);
            if (!account) {
                return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
            }
            accountStatementData.accountId = account._id;
        }

        const accountStatement = new AccountStatement(accountStatementData);
        await accountStatement.save();

        res.status(201).json({
            success: true,
            message: 'Estado de cuenta creado exitosamente',
            data: accountStatement
        });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al crear el estado de cuenta', error: error.message });
    }
};

export const getAccountStatements = async (req, res) => {
    try {
        const { page = 1, limit = 10, accountId, accountNumber } = req.query;
        const filter = {};

        if (accountId) {
            if (!mongoose.Types.ObjectId.isValid(accountId)) {
                return res.status(400).json({ success: false, message: 'accountId invalido' });
            }
            filter.accountId = new mongoose.Types.ObjectId(accountId);
        }

        if (accountNumber) {
            const account = await resolveAccountByCode(accountNumber);
            if (!account) {
                return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
            }
            filter.accountId = account._id;
        }

        const numericPage  = parseInt(page, 10);
        const numericLimit = parseInt(limit, 10);

        const accountStatements = await AccountStatement.find(filter)
            .limit(numericLimit)
            .skip((numericPage - 1) * numericLimit)
            .sort({ createdAt: -1 });

        const total = await AccountStatement.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: accountStatements,
            pagination: {
                currentPage: numericPage,
                totalPages: Math.ceil(total / numericLimit),
                totalRecords: total,
                limit: numericLimit
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al mandar los estados de cuenta', error: error.message });
    }
};

export const updateAccountStatement = async (req, res) => {
    try {
        const { id } = req.params;
        const accountStatement = await AccountStatement.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!accountStatement) {
            return res.status(404).json({ success: false, message: 'Estado de cuenta no encontrado' });
        }

        res.status(200).json({ success: true, message: 'Estado de cuenta actualizado exitosamente', data: accountStatement });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al actualizar el estado de cuenta', error: error.message });
    }
};

export const deleteAccountStatement = async (req, res) => {
    try {
        const { id } = req.params;
        const accountStatement = await AccountStatement.findByIdAndDelete(id);

        if (!accountStatement) {
            return res.status(404).json({ success: false, message: 'Estado de cuenta no encontrado' });
        }

        res.status(200).json({ success: true, message: 'Estado de cuenta eliminado exitosamente' });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al eliminar el estado de cuenta', error: error.message });
    }
};

export const getAccountStatementById = async (req, res) => {
    try {
        const { id } = req.params;
        const accountStatement = await AccountStatement.findById(id);

        if (!accountStatement) {
            return res.status(404).json({ success: false, message: 'Estado de cuenta no encontrado' });
        }

        res.status(200).json({ success: true, data: accountStatement });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al buscar el estado de cuenta', error: error.message });
    }
};

export const downloadAccountStatementPdfByAccountNumber = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        const account = await resolveAccountByCode(accountNumber);

        if (!account) {
            return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
        }

        const { periodStart, periodEnd } = parseDateRange(req.query);

        const transactions = await Transaction.find({
            status: 'exitosa',
            transactionDate: { $gte: periodStart, $lte: periodEnd },
            $or: [
                { sourceAccountNumber: account.accountNumber },
                { destinationAccountNumber: account.accountNumber }
            ]
        }).sort({ transactionDate: 1 });

        const summary = buildStatementSummary({ account, transactions, periodStart, periodEnd });

        const statement = await AccountStatement.create({
            accountId:             account._id,
            periodStart:           summary.periodStart,
            periodEnd:             summary.periodEnd,
            openingBalance:        summary.openingBalance,
            closingBalance:        summary.closingBalance,
            totalDeposits:         summary.totalDeposits,
            totalWithdrawals:      summary.totalWithdrawals,
            totalTransfersSent:    summary.totalTransfersSent,
            totalTransfersReceived: summary.totalTransfersReceived,
            interestEarned:        summary.interestEarned,
            feesCharged:           summary.feesCharged
        });

        const pdfBuffer = generateStatementPdf({
            account: {
                bankName:      account.bankName      ?? 'Banco Nacional',
                ownerName:     account.ownerName     ?? account.userId,
                accountNumber: account.accountNumber,
                accountType:   account.accountType   ?? account.type,
                currency:      account.currencyCode  ?? 'GTQ',
            },
            summary,
            transactions: transactions.map((tx) => ({
                date:                   tx.transactionDate,
                transactionType:        tx.transactionType,
                amount:                 tx.amount,
                description:            tx.description,
                sourceAccountNumber:    tx.sourceAccountNumber,
                destinationAccountNumber: tx.destinationAccountNumber,
            })),
        });

        ensureStatementsDir();
        const filename   = `statement-${account.accountNumber}-${statement._id}.pdf`;
        const outputPath = path.join(STATEMENTS_DIR, filename);
        fs.writeFileSync(outputPath, pdfBuffer);

        statement.pdfFile = outputPath;
        await statement.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(pdfBuffer);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error al generar el PDF del estado de cuenta',
            error: error.message
        });
    }
};