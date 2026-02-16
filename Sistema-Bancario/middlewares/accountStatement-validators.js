import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

// Validaciones para crear estado de cuenta (account statement)
export const validateCreateAccountStatement = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE', 'USER_ROLE'),
    body('accountId')
        .notEmpty()
        .withMessage('El ID de la cuenta es requerido'),
    body('statementDate')
        .notEmpty()
        .withMessage('La fecha del estado es requerida')
        .isISO8601()
        .withMessage('La fecha debe ser en formato ISO8601'),
    body('totalDeposits')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total de depósitos debe ser un número positivo'),
    body('totalWithdrawals')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total de retiros debe ser un número positivo'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    checkValidators,
];

// Validaciones para actualizar estado de cuenta
export const validateUpdateAccountStatement = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE', 'USER_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID del estado es requerido'),
    body('totalDeposits')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total de depósitos debe ser un número positivo'),
    body('totalWithdrawals')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total de retiros debe ser un número positivo'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    checkValidators,
];

// Validaciones para obtener/eliminar estado específico
export const validateAccountStatementById = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE', 'USER_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID del estado es requerido'),
    checkValidators,
];
