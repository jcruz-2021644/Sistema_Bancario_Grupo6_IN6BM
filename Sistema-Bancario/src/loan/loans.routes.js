import { Router } from "express";
import { createLoan, getLoans } from "./loans.controller.js";

const router = Router();

router.post(
    '/create',
    createLoan
)
router.get(
    '/',
    getLoans
)

export default router;