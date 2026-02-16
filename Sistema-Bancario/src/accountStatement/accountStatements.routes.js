import { Router } from "express";
import { createAccountStatement, getAccountStatements, updateAccountStatement, deleteAccountStatement, getAccountStatementById } from "./accountStatements.controller.js";
import { validateCreateAccountStatement, validateUpdateAccountStatement, validateAccountStatementById } from "../../middlewares/accountStatement-validators.js";
const router = Router();

router.post(
    '/create',
    validateCreateAccountStatement,
    createAccountStatement
)

router.get(
    '/',
    getAccountStatements
)

router.put(
    '/:id',
    validateUpdateAccountStatement,
    updateAccountStatement
)

router.delete(
    '/:id',
    validateAccountStatementById,
    deleteAccountStatement
)

router.get(
    '/:id',
    validateAccountStatementById,
    getAccountStatementById
)
export default router;