import { Router } from "express";
import { createAccountLock, getAccountLocks, getAccountLockById, updateAccountLock, deleteAccountLock } from "./accountLock.controller.js";

const router = Router();

router.post(
    '/create',
    createAccountLock
)
router.get(
    '/',
    getAccountLocks
)
router.get(
    '/:id',
    getAccountLockById
)
router.put(
    '/:id',
    updateAccountLock
)
router.delete(
    '/:id',
    deleteAccountLock
)

export default router;