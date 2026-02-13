import { Router } from "express";
import { createLoan, getLoans, getLoanById, updateLoan, deleteLoan } from "./loans.controller.js";

const router = Router();

router.post(
    '/create',
    createLoan
)
router.get(
    '/',
    getLoans
)
router.get(
    '/:id',
    getLoanById
)
router.put(
    '/:id',
    updateLoan
)
router.delete(
    '/:id',
    deleteLoan
)

export default router;