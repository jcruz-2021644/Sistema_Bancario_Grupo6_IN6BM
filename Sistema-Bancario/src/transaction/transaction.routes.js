import { Router } from "express";
import { createTransaction, getTransactions, updateTransaction, deleteTransaction, getTransactionById } from "./transaction.controller.js";
import { get } from "mongoose";

const router = Router();

router.post(
    '/create',
    createTransaction
)
router.get(
    '/',
    getTransactions
)
router.put(
    '/:id',
    updateTransaction
)
router.delete(
    '/:id',
    deleteTransaction
)
router.get(
    '/:id', 
    getTransactionById
)
export default router;