import { Router } from "express";
import { createAccount, getAccounts, updateAccount, deleteAccount, getAccountById, changeAccountStatus } from "./accounts.controller.js";
import { validateCreateAccount, validateUpdateAccount, validateAccountById } from "../../middlewares/accounts-validators.js";

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
    '/:id',
    validateUpdateAccount,
    updateAccount
)
router.delete(
    '/:id',
    validateAccountById,
    deleteAccount   
)
router.get(
    '/:id',
    validateAccountById,
    getAccountById
)
router.patch(
    '/:id/status', 
    changeAccountStatus
)
export default router;