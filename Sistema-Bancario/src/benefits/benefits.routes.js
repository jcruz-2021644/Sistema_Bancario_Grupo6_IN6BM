'use strict';

import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { listFranchiseBenefits } from './benefits.controller.js';

const router = Router();

router.get(
    '/',
    validateJWT,
    listFranchiseBenefits
);

export default router;
