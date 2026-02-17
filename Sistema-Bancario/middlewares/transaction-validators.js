import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

// Validaciones para crear transacción
export const validateCreateTransaction = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE', 'USER_ROLE'),
    body('sourceAccountId')
        .notEmpty()
        .withMessage('El ID de cuenta origen es requerido'),
    body('destinationAccountId')
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
        .isIn(['deposito', 'retiro', 'transferencia', 'pago_servicio', 'pago_prestamo'])
        .withMessage('Tipo de transacción no válido'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    body('status')
        .optional()
        .isIn(['exitosa', 'pendiente', 'rechazada', 'reversada'])
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
    body('status')
        .optional()
        .isIn(['exitosa', 'pendiente', 'rechazada', 'reversada'])
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
