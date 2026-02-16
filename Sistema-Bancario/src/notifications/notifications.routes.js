import { Router } from "express";
import { createNotification, getNotifications, getNotificationById,  updateNotification, deleteNotification, changeNotificationStatus } from "./notifications.controller.js";
import { validateCreateNotification, validateUpdateNotification, validateNotificationById } from "../../middlewares/notifications-validators.js";

const router = Router();

router.post(
    '/create',
    validateCreateNotification,
    createNotification
)
router.get(
    '/',
    getNotifications
)
router.get(
    '/:id',
    validateNotificationById,
    getNotificationById
)
router.put(
    '/:id',
    validateUpdateNotification,
    updateNotification
)
router.delete(
    '/:id',
    validateNotificationById,
    deleteNotification
)
router.patch(
    '/:id/status', 
    changeNotificationStatus
)

export default router;