import { Router } from "express";
import { createTransaction, getTransactions, updateTransaction, deleteTransaction, getTransactionById } from "./transaction.controller.js";
import { validateCreateTransaction, validateUpdateTransaction, validateTransactionById } from "../../middlewares/transaction-validators.js";

const router = Router();

router.post(
    '/create',
    validateCreateTransaction,
    createTransaction
)
router.get(
    '/',
    getTransactions
)
router.put(
    '/:id',
    validateUpdateTransaction,
    updateTransaction
)
router.delete(
    '/:id',
    validateTransactionById,
    deleteTransaction
)
router.get(
    '/:id',
    validateTransactionById,
    getTransactionById
)
export default router;