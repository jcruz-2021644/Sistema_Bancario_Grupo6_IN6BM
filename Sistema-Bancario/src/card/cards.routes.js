import { Router } from "express";
import { createCard, getCards, updateCard, deleteCard, getCardById, changeCardStatus } from "./cards.controller.js";

const router = Router();

router.post(
    '/create',
    createCard
)
router.get(
    '/',
    getCards
)
router.put(
    '/:id',
    updateCard
)
router.delete(
    '/:id',
    deleteCard
)
router.get(
    '/:id',
    getCardById
)
router.patch(
    '/:id/status', 
    changeCardStatus
)
export default router;