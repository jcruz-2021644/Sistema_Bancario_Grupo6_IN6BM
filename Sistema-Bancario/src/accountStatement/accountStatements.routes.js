import { Router } from "express";
import { createAccountStatement, getAccountStatements } from "./accountStatements.controller.js";

const router = Router();

router.post(
    '/create',
    createAccountStatement
)
router.get(
    '/',
    getAccountStatements
)

export default router;