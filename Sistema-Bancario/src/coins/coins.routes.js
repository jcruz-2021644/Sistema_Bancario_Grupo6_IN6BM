import { Router } from "express";
import { createCurrency, getCurrencies } from "./coins.controller.js";

const router = Router();

router.post(
    '/create',
    createCurrency
)
router.get(
    '/',
    getCurrencies
)

export default router;