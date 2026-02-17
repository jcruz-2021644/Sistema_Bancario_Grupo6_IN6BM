import { Router } from "express";
import { createAccountLock, getAccountLocks, getAccountLockById, updateAccountLock, deleteAccountLock } from "./accountLock.controller.js";
import { validateCreateAccountLock, validateUpdateAccountLock, validateAccountLockById } from "../../middlewares/accountLock-validators.js";

const router = Router();

router.post(
    '/create',
    validateCreateAccountLock,
    createAccountLock
)
router.get(
    '/',
    getAccountLocks
)
router.get(
    '/:id',
    validateAccountLockById,
    getAccountLockById
)
router.put(
    '/:id',
    validateUpdateAccountLock,
    updateAccountLock
)
router.delete(
    '/:id',
    validateAccountLockById,
    deleteAccountLock
)

export default router;