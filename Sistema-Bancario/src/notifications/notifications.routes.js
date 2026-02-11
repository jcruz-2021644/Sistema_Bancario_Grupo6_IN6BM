import { Router } from "express";
import { createNotification, getNotifications } from "./notifications.controller.js";

const router = Router();

router.post(
    '/create',
    createNotification
)
router.get(
    '/',
    getNotifications
)

export default router;