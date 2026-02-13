import { Router } from "express";
import { createNotification, getNotifications, getNotificationById,  updateNotification, deleteNotification, changeNotificationStatus } from "./notifications.controller.js";

const router = Router();

router.post(
    '/create',
    createNotification
)
router.get(
    '/',
    getNotifications
)
router.get(
    '/:id',
    getNotificationById
)
router.put(
    '/:id',
    updateNotification
)
router.delete(
    '/:id',
    deleteNotification
)
router.patch(
    '/:id/status', 
    changeNotificationStatus
)

export default router;