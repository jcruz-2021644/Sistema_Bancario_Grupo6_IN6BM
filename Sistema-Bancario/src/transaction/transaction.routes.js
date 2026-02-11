import { Router } from "express";
import { createTransaction, getTransactions } from "./transaction.controller.js";

const router = Router();

router.post(
    '/create',
    createTransaction
)
router.get(
    '/',
    getTransactions
)

export default router;