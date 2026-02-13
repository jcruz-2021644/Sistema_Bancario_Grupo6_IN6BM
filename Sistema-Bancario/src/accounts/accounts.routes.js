import { Router } from "express";
import { createAccount, getAccounts, updateAccount, deleteAccount, getAccountById, changeAccountStatus } from "./accounts.controller.js";

const router = Router();

router.post(
    '/create',
    createAccount
)
router.get(
    '/',
    getAccounts
)
router.put(
    '/:id',
    updateAccount
)
router.delete(
    '/:id',
    deleteAccount   
)
router.get(
    '/:id',
    getAccountById
)
router.patch(
    '/:id/status', 
    changeAccountStatus
)
export default router;