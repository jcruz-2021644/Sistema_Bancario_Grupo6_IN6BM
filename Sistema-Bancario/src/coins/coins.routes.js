import { Router } from "express";
import { createCurrency, getCurrencies, updateCurrency, deleteCurrency } from "./coins.controller.js";

const router = Router();

router.post(
    '/create',
    createCurrency
)
router.get(
    '/',
    getCurrencies
)
router.put(
    '/:id',
    updateCurrency
)

router.delete(
    '/:id',
    deleteCurrency
)
export default router;