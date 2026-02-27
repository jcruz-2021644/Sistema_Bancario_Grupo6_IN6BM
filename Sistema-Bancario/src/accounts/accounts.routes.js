import { Router } from "express";
import { createAccount, getAccounts, updateAccount, deleteAccount, changeAccountStatus, getAccountByAccountNumber } from "./accounts.controller.js";
import { validateCreateAccount, validateUpdateAccount, validateAccountById, validateReadAccountById } from "../../middlewares/accounts-validators.js";

const router = Router();

router.post(
    '/create',
    validateCreateAccount,
    createAccount
)
router.get(
    '/',
    getAccounts
)
router.put(
    '/:accountNumber',
    validateUpdateAccount,
    updateAccount
)
router.delete(
    '/:accountNumber',
    validateAccountById,
    deleteAccount
)
router.get(
    '/:accountNumber',
    validateReadAccountById,
    getAccountByAccountNumber
)
router.patch(
    '/:accountNumber/status',
    validateAccountById,
    changeAccountStatus
)
export default router;
