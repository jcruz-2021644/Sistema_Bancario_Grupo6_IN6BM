import { Router } from "express";
import { createCard, getCards, updateCard, deleteCard, getCardById, changeCardStatus } from "./cards.controller.js";
import { validateCreateCard, validateUpdateCard, validateCardById } from "../../middlewares/card-validators.js";

const router = Router();

router.post(
    '/create',
    validateCreateCard,
    createCard
)
router.get(
    '/',
    getCards
)
router.put(
    '/:id',
    validateUpdateCard,
    updateCard
)
router.delete(
    '/:id',
    validateCardById,
    deleteCard
)
router.get(
    '/:id',
    validateCardById,
    getCardById
)
router.patch(
    '/:id/status',
    changeCardStatus
)
export default router;