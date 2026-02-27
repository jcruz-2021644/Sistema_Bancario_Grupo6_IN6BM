import { Router } from "express";
import { createLoan, getLoans, getLoanById, updateLoan, deleteLoan } from "./loans.controller.js";
import { validateCreateLoan, validateUpdateLoan, validateLoanById } from "../../middlewares/loan-validators.js";

const router = Router();

router.post(
    '/create',
    validateCreateLoan,
    createLoan
)
router.get(
    '/',
    getLoans
)
router.get(
    '/:id',
    validateLoanById,
    getLoanById
)
router.put(
    '/:id',
    validateUpdateLoan,
    updateLoan
)
router.delete(
    '/:id',
    validateLoanById,
    deleteLoan
)

export default router;