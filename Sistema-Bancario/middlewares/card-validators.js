import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

// Validaciones para crear tarjeta
export const validateCreateCard = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    body('cardNumber')
        .trim()
        .notEmpty()
        .withMessage('El número de tarjeta es requerido')
        .isLength({ min: 13, max: 19 })
        .withMessage('El número de tarjeta debe tener entre 13 y 19 dígitos'),
    body('accountId')
        .notEmpty()
        .withMessage('El ID de la cuenta es requerido'),
    body('cardType')
        .notEmpty()
        .withMessage('El tipo de tarjeta es requerido')
        .isIn(['debito', 'credito'])
        .withMessage('Tipo de tarjeta no válida'),
    body('expirationDate')
        .notEmpty()
        .withMessage('La fecha de vencimiento es requerida')
        .withMessage('La fecha debe estar en formato MM/YY'),
    body('status')
        .optional()
        .isIn(['activa', 'bloqueada', 'vencida', 'cancelada'])
        .withMessage('Estado de tarjeta no válido'),
    checkValidators,
];

// Validaciones para actualizar tarjeta
export const validateUpdateCard = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID de la tarjeta es requerido'),
    body('cardType')
        .optional()
        .isIn(['debito', 'credito'])
        .withMessage('Tipo de tarjeta no válida'),
    body('status')
        .optional()
        .isIn(['activa', 'bloqueada', 'vencida', 'cancelada'])
        .withMessage('Estado de tarjeta no válido'),
    checkValidators,
];

// Validaciones para obtener/eliminar tarjeta específica
export const validateCardById = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID de la tarjeta es requerido'),
    checkValidators,
];
