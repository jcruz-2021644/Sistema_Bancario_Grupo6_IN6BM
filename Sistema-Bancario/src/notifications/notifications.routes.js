import { Router } from "express";
import { createNotification, getNotifications, getNotificationById,  updateNotification, deleteNotification, changeNotificationStatus } from "./notifications.controller.js";
import { validateCreateNotification, validateUpdateNotification, validateNotificationById } from "../../middlewares/notifications-validators.js";
import { validateJWT } from "../../middlewares/validate-JWT.js";
import { requireRole } from "../../middlewares/validate-role.js";
const router = Router();

router.post(
    '/create',
    validateCreateNotification,
    createNotification
)
router.get(
    '/',
    validateJWT,
    requireRole('ADMIN_ROLE','MANAGER_ROLE','ATM_ROLE'),
    getNotifications
)
router.get(
    '/:id',
    validateJWT,
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
    validateJWT,
    validateNotificationById,
    changeNotificationStatus
)

export default router;