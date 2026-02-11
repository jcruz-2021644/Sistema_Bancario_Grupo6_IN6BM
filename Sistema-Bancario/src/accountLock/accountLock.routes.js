import { Router } from "express";
import { createAccountLock, getAccountLocks } from "./accountLock.controller.js";

const router = Router();

router.post(
    '/create',
    createAccountLock
)
router.get(
    '/',
    getAccountLocks
)

export default router;