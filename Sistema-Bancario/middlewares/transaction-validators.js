import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

// Validaciones para crear transacción
export const validateCreateTransaction = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE', 'USER_ROLE'),
    body('fromAccountId')
        .notEmpty()
        .withMessage('El ID de cuenta origen es requerido'),
    body('toAccountId')
        .notEmpty()
        .withMessage('El ID de cuenta destino es requerido'),
    body('amount')
        .notEmpty()
        .withMessage('El monto es requerido')
        .isFloat({ min: 0 })
        .withMessage('El monto debe ser mayor a 0'),
    body('transactionType')
        .notEmpty()
        .withMessage('El tipo de transacción es requerido')
        .isIn(['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'PAYMENT'])
        .withMessage('Tipo de transacción no válido'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    body('transactionStatus')
        .optional()
        .isIn(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'])
        .withMessage('Estado de transacción no válido'),
    checkValidators,
];

// Validaciones para actualizar transacción
export const validateUpdateTransaction = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE', 'USER_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID de la transacción es requerido'),
    body('transactionStatus')
        .optional()
        .isIn(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'])
        .withMessage('Estado de transacción no válido'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    checkValidators,
];

// Validaciones para obtener/eliminar transacción específica
export const validateTransactionById = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE', 'USER_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID de la transacción es requerido'),
    checkValidators,
];
