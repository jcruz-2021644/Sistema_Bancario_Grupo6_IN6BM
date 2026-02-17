import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

// Validaciones para crear cuenta
export const validateCreateAccount = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE'),
    body('accountNumber')
        .trim()
        .notEmpty()
        .withMessage('El número de cuenta es requerido')
        .isLength({ min: 5, max: 50 })
        .withMessage('El número de cuenta debe tener entre 5 y 50 caracteres'),
    body('accountType')
        .notEmpty()
        .withMessage('El tipo de cuenta es requerido')
        .isIn(['ahorro', 'corriente', 'nomina'])
        .withMessage('Tipo de cuenta no válida'),
    body('userId')
        .notEmpty()
        .withMessage('El ID del usuario es requerido'),
    body('balance')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El balance debe ser un número positivo'),
    body('currency')
        .optional()
        .isLength({ min: 1, max: 10 })
        .withMessage('El código de moneda debe tener entre 1 y 10 caracteres'),
    checkValidators,
];

// Validaciones para actualizar cuenta
export const validateUpdateAccount = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID de la cuenta es requerido'),
    body('accountType')
        .optional()
        .isIn(['ahorro', 'corriente', 'nomina'])
        .withMessage('Tipo de cuenta no válida'),
    body('balance')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El balance debe ser un número positivo'),
    body('currency')
        .optional()
        .isLength({ min: 1, max: 10 })
        .withMessage('El código de moneda debe tener entre 1 y 10 caracteres'),
    checkValidators,
];

// Validaciones para obtener/eliminar cuenta específica
export const validateAccountById = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID de la cuenta es requerido'),
    checkValidators,
];