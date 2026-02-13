import { Router } from "express";
import { createAccountStatement, getAccountStatements, updateAccountStatement, deleteAccountStatement, getAccountStatementById } from "./accountStatements.controller.js";

const router = Router();

router.post(
    '/create',
    createAccountStatement
)

router.get(
    '/',
    getAccountStatements
)

router.put(
    '/:id',
    updateAccountStatement
)

router.delete(
    '/:id',
    deleteAccountStatement
)

router.get(
    '/:id', 
    getAccountStatementById
)
export default router;