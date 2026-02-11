import { Router } from "express";
import { createCard, getCards } from "./cards.controller.js";

const router = Router();

router.post(
    '/create',
    createCard
)
router.get(
    '/',
    getCards
)

export default router;