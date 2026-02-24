import {
    registerUserHelper,
    loginUserHelper,
    verifyEmailHelper,
    resendVerificationEmailHelper,
    forgotPasswordHelper,
    resetPasswordHelper,
} from '../../helpers/auth-operations.js';
import { getUserProfileHelper } from '../../helpers/profile-operations.js';
import { asyncHandler } from '../../middlewares/server-genericError-handler.js';

export const register = asyncHandler(async (req, res) => {
    try {
        // Agregar la imagen de perfil si fue subida
        const userData = {
            ...req.body,
            profilePicture: req.file ? req.file.path.replace(/\\/g, '/') : null,
        };

        const result = await registerUserHelper(userData);

        res.status(201).json(result);
    } catch (error) {
        console.error('Error in register controller:', error);

        let statusCode = 400;
        if (
<<<<<<< HEAD
        error.message.includes('ya está registrado') ||
        error.message.includes('ya está en uso') ||
        error.message.includes('Ya existe un usuario')
        ) {
        statusCode = 409; // Conflict
        }

        res.status(statusCode).json({
        success: false,
        message: error.message || 'Error en el registro',
        error: error.message,
=======
            error.message.includes('ya está registrado') ||
            error.message.includes('ya está en uso') ||
            error.message.includes('Ya existe un usuario')
        ) {
            statusCode = 409; // Conflict
        }

        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error en el registro',
            error: error.message,
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        });
    }
});

export const login = asyncHandler(async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        const result = await loginUserHelper(emailOrUsername, password);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in login controller:', error);

        let statusCode = 401;
        if (
<<<<<<< HEAD
        error.message.includes('bloqueada') ||
        error.message.includes('desactivada')
        ) {
        statusCode = 423; // Locked
        }

        res.status(statusCode).json({
        success: false,
        message: error.message || 'Error en el login',
        error: error.message,
=======
            error.message.includes('bloqueada') ||
            error.message.includes('desactivada')
        ) {
            statusCode = 423; // Locked
        }

        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error en el login',
            error: error.message,
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        });
    }
});

export const verifyEmail = asyncHandler(async (req, res) => {
    try {
        const { token } = req.body;
        const result = await verifyEmailHelper(token);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in verifyEmail controller:', error);

        let statusCode = 400;
        if (error.message.includes('no encontrado')) {
<<<<<<< HEAD
        statusCode = 404;
        } else if (
        error.message.includes('inválido') ||
        error.message.includes('expirado')
        ) {
        statusCode = 401;
        }

        res.status(statusCode).json({
        success: false,
        message: error.message || 'Error en la verificación',
        error: error.message,
=======
            statusCode = 404;
        } else if (
            error.message.includes('inválido') ||
            error.message.includes('expirado')
        ) {
            statusCode = 401;
        }

        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error en la verificación',
            error: error.message,
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        });
    }
});

export const resendVerification = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;
        const result = await resendVerificationEmailHelper(email);

        // Check result.success to determine status code
        if (!result.success) {
<<<<<<< HEAD
        if (result.message.includes('no encontrado')) {
            return res.status(404).json(result);
        }
        if (result.message.includes('ya ha sido verificado')) {
            return res.status(400).json(result);
        }
        // Email sending failed
        return res.status(503).json(result);
=======
            if (result.message.includes('no encontrado')) {
                return res.status(404).json(result);
            }
            if (result.message.includes('ya ha sido verificado')) {
                return res.status(400).json(result);
            }
            // Email sending failed
            return res.status(503).json(result);
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in resendVerification controller:', error);

        res.status(500).json({
<<<<<<< HEAD
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
=======
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        });
    }
});

export const forgotPassword = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;
        const result = await forgotPasswordHelper(email);

        // forgotPassword always returns success for security, even if user not found
        // But if email sending fails, we should return 503
        if (!result.success && result.data?.initiated === false) {
<<<<<<< HEAD
        return res.status(503).json(result);
=======
            return res.status(503).json(result);
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in forgotPassword controller:', error);

        res.status(500).json({
<<<<<<< HEAD
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
=======
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        });
    }
});

export const resetPassword = asyncHandler(async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const result = await resetPasswordHelper(token, newPassword);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in resetPassword controller:', error);

        let statusCode = 400;
        if (error.message.includes('no encontrado')) {
<<<<<<< HEAD
        statusCode = 404;
        } else if (
        error.message.includes('inválido') ||
        error.message.includes('expirado')
        ) {
        statusCode = 401;
        }

        res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al resetear contraseña',
        error: error.message,
=======
            statusCode = 404;
        } else if (
            error.message.includes('inválido') ||
            error.message.includes('expirado')
        ) {
            statusCode = 401;
        }

        res.status(statusCode).json({
            success: false,
            message: error.message || 'Error al resetear contraseña',
            error: error.message,
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        });
    }
});

export const getProfile = asyncHandler(async (req, res) => {
    const userId = req.userId; // Viene del middleware validateJWT
    const user = await getUserProfileHelper(userId);

<<<<<<< HEAD
  // Respuesta estandarizada con envelope
=======
    // Respuesta estandarizada con envelope
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
    return res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: user,
    });
});

export const getProfileById = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({
<<<<<<< HEAD
        success: false,
        message: 'El userId es requerido',
=======
            success: false,
            message: 'El userId es requerido',
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        });
    }

    const user = await getUserProfileHelper(userId);

    // Respuesta estandarizada con envelope
    return res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: user,
    });
});
