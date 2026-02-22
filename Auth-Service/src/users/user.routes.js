import { Router } from 'express';
import {
    updateUserRole,
    getUserRoles,
    getUsersByRole,
    updateUserIncome,
} from './user.controller.js';

const router = Router();

// PUT /api/v1/users/:userId/role
router.put('/:userId/role', ...updateUserRole);

// GET /api/v1/users/:userId/roles
router.get('/:userId/roles', ...getUserRoles);

// GET /api/v1/users/by-role/:roleName
router.get('/by-role/:roleName', ...getUsersByRole);

// PUT /api/v1/users/:userId/income
router.put('/:userId/income', ...updateUserIncome);
export default router;
