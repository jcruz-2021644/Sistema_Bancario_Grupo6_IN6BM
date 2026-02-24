import { Router } from 'express';
import {
    updateUserRole,
    getUserRoles,
    getUsersByRole,
<<<<<<< HEAD
=======
    updateUserIncome,
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
} from './user.controller.js';

const router = Router();

// PUT /api/v1/users/:userId/role
router.put('/:userId/role', ...updateUserRole);

// GET /api/v1/users/:userId/roles
router.get('/:userId/roles', ...getUserRoles);

// GET /api/v1/users/by-role/:roleName
router.get('/by-role/:roleName', ...getUsersByRole);

<<<<<<< HEAD
=======
// PUT /api/v1/users/:userId/income
router.put('/:userId/income', ...updateUserIncome);
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
export default router;
