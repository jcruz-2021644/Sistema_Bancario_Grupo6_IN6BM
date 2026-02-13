import { Router } from "express";
import { createCurrency, getCurrencies, updateCurrency, deleteCurrency, getCurrencyById, changeCurrencyStatus } from "./coins.controller.js";

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

router.get(
    '/:id',
    getCurrencyById
)
router.patch(
    '/:id/status', 
    changeCurrencyStatus
)
export default router;