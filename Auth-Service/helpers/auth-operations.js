import crypto from 'crypto';
import {
    checkUserExists,
    createNewUser,
    findUserByEmailOrUsername,
    updateEmailVerificationToken,
    markEmailAsVerified,
    findUserByEmail,
    updatePasswordResetToken,
    updateUserPassword,
    findUserByEmailVerificationToken,
    findUserByPasswordResetToken,
} from './user-db.js';
import {
    generateEmailVerificationToken,
    generatePasswordResetToken,
} from '../utils/auth-helpers.js';
import { verifyPassword } from '../utils/password-utils.js';
import { buildUserResponse } from '../utils/user-helpers.js';
import { sendVerificationEmail } from './email-service.js';
import { generateJWT } from './generate-jwt.js';
import path from 'path';
import { uploadImage } from './cloudinary-service.js';
import { config } from '../configs/config.js';

const getExpirationTime = (timeString) => {
    const timeValue = parseInt(timeString);
    const timeUnit = timeString.replace(timeValue.toString(), '');

    switch (timeUnit) {
        case 's':
<<<<<<< HEAD
        return timeValue * 1000;
        case 'm':
        return timeValue * 60 * 1000;
        case 'h':
        return timeValue * 60 * 60 * 1000;
        case 'd':
        return timeValue * 24 * 60 * 60 * 1000;
        default:
        return 30 * 60 * 1000; // Default: 30 minutos
    }
};

export const registerUserHelper = async (userData) => {
    try {
        const { email, username, password, name, surname, phone, profilePicture } =
        userData;

        // Validation is now handled by express-validator middleware in routes
        const userExists = await checkUserExists(email, username);
        if (userExists) {
        throw new Error(
            'Ya existe un usuario con este email o nombre de usuario'
        );
        }
        let profilePictureToStore = profilePicture;
        if (profilePicture) {
        const uploadPath = config.upload.uploadPath;

        // Detectar si es un archivo local
        const isLocalFile =
            profilePicture.includes('uploads/') ||
            profilePicture.includes(uploadPath) ||
            profilePicture.startsWith('./');

        if (isLocalFile) {
            try {
            // Generar nombre como .NET: profile-<12chars>.jpg
            const ext = path.extname(profilePicture);
            const randomHex = crypto.randomBytes(6).toString('hex');
            const cloudinaryFileName = `profile-${randomHex}${ext}`;

            profilePictureToStore = await uploadImage(
                profilePicture,
                cloudinaryFileName
            );
            } catch (err) {
            console.error(
                'Error uploading profile picture to Cloudinary during registration:',
                err
            );
            profilePictureToStore = null;
            }
        } else {
            // Si viene una URL/ruta de Cloudinary, normalizar y almacenar solo el filename
            profilePictureToStore = profilePicture;
            /*try {
            const baseUrl = config.cloudinary.baseUrl || '';
            const folder = config.cloudinary.folder || '';
            let normalized = profilePicture;
            if (normalized.startsWith(baseUrl)) {
                normalized = normalized.slice(baseUrl.length);
            }
            if (folder && normalized.startsWith(`${folder}/`)) {
                normalized = normalized.slice(folder.length + 1);
            }
            // Si aún hay slashes, tomar el último segmento
            profilePictureToStore = normalized.split('/').pop();
            } catch (normErr) {
            console.warn('Could not normalize profile picture path:', normErr);
            // fallback: mantener nulo para usar el default
            profilePictureToStore = null;
            }*/
        }
    }

        // Crear el usuario
        const newUser = await createNewUser({
        name,
        surname,
        username,
        email,
        password,
        phone,
        profilePicture: profilePictureToStore,
        });

        // Generar token de verificación de email
        const verificationToken = await generateEmailVerificationToken();
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Guardar el token en la base de datos
        await updateEmailVerificationToken(
        newUser.Id,
        verificationToken,
        tokenExpiry
        );

        // Enviar email de verificación en background para no bloquear la respuesta
        // Si falla, se registra en consola pero no afecta la respuesta
        Promise.resolve()
        .then(() => sendVerificationEmail(email, name, verificationToken))
        .catch((err) =>
            console.error('Async email send (verification) failed:', err)
        );

        // Note: No JWT token returned in register (aligned with .NET RegisterResponseDto)
        // JWT will be generated only at login

        // RegisterResponseDto equivalent structure
        return {
        success: true,
        user: buildUserResponse(newUser),
        message:
            'Usuario registrado exitosamente. Por favor, verifica tu email para activar la cuenta.',
        emailVerificationRequired: true,
=======
            return timeValue * 1000;
        case 'm':
            return timeValue * 60 * 1000;
        case 'h':
            return timeValue * 60 * 60 * 1000;
        case 'd':
            return timeValue * 24 * 60 * 60 * 1000;
        default:
            return 30 * 60 * 1000; // Default: 30 minutos
    }
};
export const registerUserHelper = async (userData) => {
    try {
        const { email, username, password, name, surname, phone, profilePicture } =
            userData;
        const userExists = await checkUserExists(email, username);
        if (userExists) {
            throw new Error(
                'Ya existe un usuario con este email o nombre de usuario'
            );
        }
        let profilePictureToStore;
        if (profilePicture) {
            const uploadPath = config.upload.uploadPath;

            const isLocalFile =
                profilePicture.includes('uploads/') ||
                profilePicture.includes(uploadPath) ||
                profilePicture.startsWith('./');

            if (isLocalFile) {
                try {
                    const ext = path.extname(profilePicture);
                    const randomHex = crypto.randomBytes(6).toString('hex');
                    const cloudinaryFileName = `profile-${randomHex}${ext}`;
                    profilePictureToStore = await uploadImage(
                        profilePicture,
                        cloudinaryFileName
                    );
                } catch (err) {
                    console.error(
                        'Error uploading profile picture to Cloudinary during registration:',
                        err
                    );
                    profilePictureToStore = config.cloudinary.defaultAvatar;
                }
            } else {
                profilePictureToStore = profilePicture;
            }
        } else {
            profilePictureToStore = config.cloudinary.defaultAvatar;
        }

        const newUser = await createNewUser({
            name,
            surname,
            username,
            email,
            password,
            phone,
            profilePicture: profilePictureToStore,
        });

        const verificationToken = await generateEmailVerificationToken();
        const tokenExpiry = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        ); // 24 horas

        await updateEmailVerificationToken(
            newUser.Id,
            verificationToken,
            tokenExpiry
        );

        // Enviar email en background
        Promise.resolve()
            .then(() =>
                sendVerificationEmail(email, name, verificationToken)
            )
            .catch((err) =>
                console.error(
                    'Async email send (verification) failed:',
                    err
                )
            );

        return {
            success: true,
            user: buildUserResponse(newUser),
            message:
                'Usuario registrado exitosamente. Por favor, verifica tu email para activar la cuenta.',
            emailVerificationRequired: true,
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        };
    } catch (error) {
        console.error('Error en registro:', error);
        throw error;
    }
};
<<<<<<< HEAD

export const loginUserHelper = async (emailOrUsername, password) => {
    try {
        // Validation is now handled by express-validator middleware in routes

        // Buscar usuario por email o username
        const user = await findUserByEmailOrUsername(emailOrUsername);

        if (!user) {
        throw new Error('Credenciales inválidas');
        }

        // Verificar contraseña
        const isValidPassword = await verifyPassword(user.Password, password);

        if (!isValidPassword) {
        throw new Error('Credenciales inválidas');
        }

        // Verificar si el email está verificado
        if (!user.UserEmail || !user.UserEmail.EmailVerified) {
        throw new Error(
            'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada o reenvía el email de verificación.'
        );
        }

        // Verificar si el usuario está activo
        if (!user.Status) {
        throw new Error('Tu cuenta está desactivada. Contacta al administrador.');
        }

        // Generate JWT with role claim
        const role = user.UserRoles?.[0]?.Role?.Name || 'USER_ROLE';
        const token = await generateJWT(user.Id.toString(), { role });

        // Calcular fecha de expiración basada en la configuración
        const expiresInMs = getExpirationTime(process.env.JWT_EXPIRES_IN || '30m');
        const expiresAt = new Date(Date.now() + expiresInMs);

        // Build compact userDetails object
        const fullUser = buildUserResponse(user);
        const userDetails = {
        id: fullUser.id,
        username: fullUser.username,
        profilePicture: fullUser.profilePicture,
        role: fullUser.role,
        };

        // AuthResponseDto equivalent structure
        return {
        success: true,
        message: 'Login exitoso',
        token,
        userDetails,
        expiresAt,
=======
export const loginUserHelper = async (emailOrUsername, password) => {
    try {
        const user = await findUserByEmailOrUsername(emailOrUsername);

        if (!user) {
            throw new Error('Credenciales inválidas');
        }

        console.log("PASSWORD INGRESADO:", password);
        console.log("HASH EN BD:", user.Password);

        const isValidPassword = await verifyPassword(user.Password, password);

        console.log("¿PASSWORD VÁLIDO?:", isValidPassword);

        if (!isValidPassword) {
            throw new Error('Credenciales inválidas');
        }

        if (!user.UserEmail || !user.UserEmail.EmailVerified) {
            throw new Error(
                'Debes verificar tu email antes de iniciar sesión.'
            );
        }

        if (!user.Status) {
            throw new Error('Tu cuenta está desactivada.');
        }

        const plainUser = user.toJSON();

        const role = plainUser.UserRoles?.[0]?.Role?.Name || 'USER_ROLE';

        const token = await generateJWT(plainUser.Id.toString(), { role });

        const expiresInMs = getExpirationTime(
            process.env.JWT_EXPIRES_IN || '30m'
        );
        const expiresAt = new Date(Date.now() + expiresInMs);

        const userDetails = {
            id: plainUser.Id,
            username: plainUser.Username,
            profilePicture:
                plainUser.UserProfile?.ProfilePicture || null,
            role,
        };

        return {
            success: true,
            message: 'Login exitoso',
            token,
            userDetails,
            expiresAt,
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        };
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
};

export const verifyEmailHelper = async (token) => {
    try {
        // Verify simple token format (not JWT anymore, matching .NET)
        if (!token || typeof token !== 'string' || token.length < 40) {
<<<<<<< HEAD
        throw new Error('Token inválido para verificación de email');
=======
            throw new Error('Token inválido para verificación de email');
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        }

        // Find user by verification token (like .NET does)
        const user = await findUserByEmailVerificationToken(token);
        if (!user) {
<<<<<<< HEAD
        throw new Error('Usuario no encontrado o token inválido');
=======
            throw new Error('Usuario no encontrado o token inválido');
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        }

        // Verificar que el token no haya expirado (ya se verifica en jwt.verify, pero por seguridad)
        const userEmail = user.UserEmail;
        if (!userEmail) {
<<<<<<< HEAD
        throw new Error('Registro de email no encontrado');
        }

        if (userEmail.EmailVerified) {
        throw new Error('El email ya ha sido verificado');
=======
            throw new Error('Registro de email no encontrado');
        }

        if (userEmail.EmailVerified) {
            throw new Error('El email ya ha sido verificado');
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        }

        // Marcar el email como verificado
        await markEmailAsVerified(user.Id);

        // Enviar email de bienvenida en background (aligned with .NET)
        Promise.resolve()
<<<<<<< HEAD
        .then(async () => {
            const { sendWelcomeEmail } = await import('./email-service.js');
            return sendWelcomeEmail(user.Email, user.Name);
        })
        .catch((emailError) => {
            console.error('Async email send (welcome) failed:', emailError);
        });

        // EmailResponseDto equivalent structure
        return {
        success: true,
        message: 'Email verificado exitosamente. Ya puedes iniciar sesión.',
        data: {
            email: user.Email,
            verified: true,
        },
=======
            .then(async () => {
                const { sendWelcomeEmail } = await import('./email-service.js');
                return sendWelcomeEmail(user.Email, user.Name);
            })
            .catch((emailError) => {
                console.error('Async email send (welcome) failed:', emailError);
            });

        // EmailResponseDto equivalent structure
        return {
            success: true,
            message: 'Email verificado exitosamente. Ya puedes iniciar sesión.',
            data: {
                email: user.Email,
                verified: true,
            },
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        };
    } catch (error) {
        console.error('Error verificando email:', error);

        if (error.name === 'JsonWebTokenError') {
<<<<<<< HEAD
        throw new Error('Token de verificación inválido');
        } else if (error.name === 'TokenExpiredError') {
        throw new Error('Token de verificación expirado');
=======
            throw new Error('Token de verificación inválido');
        } else if (error.name === 'TokenExpiredError') {
            throw new Error('Token de verificación expirado');
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        }

        throw error;
    }
};

export const resendVerificationEmailHelper = async (email) => {
    try {
        const user = await findUserByEmail(email.toLowerCase());

        if (!user) {
<<<<<<< HEAD
        // EmailResponseDto equivalent structure
        return {
            success: false,
            message: 'Usuario no encontrado',
            data: { email, sent: false },
        };
=======
            // EmailResponseDto equivalent structure
            return {
                success: false,
                message: 'Usuario no encontrado',
                data: { email, sent: false },
            };
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        }

        // Verificar si ya está verificado
        if (user.UserEmail && user.UserEmail.EmailVerified) {
<<<<<<< HEAD
        // EmailResponseDto equivalent structure
        return {
            success: false,
            message: 'El email ya ha sido verificado',
            data: { email: user.Email, verified: true },
        };
=======
            // EmailResponseDto equivalent structure
            return {
                success: false,
                message: 'El email ya ha sido verificado',
                data: { email: user.Email, verified: true },
            };
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        }

        // Generar nuevo token de verificación
        const verificationToken = await generateEmailVerificationToken();
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Actualizar token en la base de datos
        await updateEmailVerificationToken(user.Id, verificationToken, tokenExpiry);

        // Enviar email de forma síncrona para reportar errores correctamente
        try {
<<<<<<< HEAD
        await sendVerificationEmail(user.Email, user.Name, verificationToken);
        // EmailResponseDto equivalent structure
        return {
            success: true,
            message: 'Email de verificación enviado exitosamente',
            data: { email: user.Email, sent: true },
        };
        } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // EmailResponseDto equivalent structure
        return {
            success: false,
            message:
            'Error al enviar el email de verificación. Por favor, intenta nuevamente más tarde.',
            data: { email: user.Email, sent: false },
        };
=======
            await sendVerificationEmail(user.Email, user.Name, verificationToken);
            // EmailResponseDto equivalent structure
            return {
                success: true,
                message: 'Email de verificación enviado exitosamente',
                data: { email: user.Email, sent: true },
            };
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // EmailResponseDto equivalent structure
            return {
                success: false,
                message:
                    'Error al enviar el email de verificación. Por favor, intenta nuevamente más tarde.',
                data: { email: user.Email, sent: false },
            };
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        }
    } catch (error) {
        console.error('Error en resendVerificationEmailHelper:', error);
        return {
<<<<<<< HEAD
        success: false,
        message: 'Error interno del servidor',
        data: { email, sent: false },
=======
            success: false,
            message: 'Error interno del servidor',
            data: { email, sent: false },
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        };
    }
};

export const forgotPasswordHelper = async (email) => {
    try {
        const user = await findUserByEmail(email.toLowerCase());

        // Por seguridad, siempre devolvemos éxito aunque el usuario no exista
        if (!user) {
<<<<<<< HEAD
        // EmailResponseDto equivalent structure
        return {
            success: true,
            message: 'Si el email existe, se ha enviado un enlace de recuperación',
            data: { email, initiated: true },
        };
=======
            // EmailResponseDto equivalent structure
            return {
                success: true,
                message: 'Si el email existe, se ha enviado un enlace de recuperación',
                data: { email, initiated: true },
            };
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        }

        // Generar token de reset
        const resetToken = await generatePasswordResetToken();
        const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Actualizar token en la base de datos
        await updatePasswordResetToken(user.Id, resetToken, tokenExpiry);

        // Enviar email de reset
        const { sendPasswordResetEmail } = await import('./email-service.js');
        // Enviar email en background; no bloquear la respuesta
        Promise.resolve()
<<<<<<< HEAD
        .then(() => sendPasswordResetEmail(user.Email, user.Name, resetToken))
        .catch((emailError) => {
            console.error(
            `Failed to send password reset email to ${email}:`,
            emailError
            );
        });

        // EmailResponseDto equivalent structure
        return {
        success: true,
        message: 'Si el email existe, se ha enviado un enlace de recuperación',
        data: { email, initiated: true },
=======
            .then(() => sendPasswordResetEmail(user.Email, user.Name, resetToken))
            .catch((emailError) => {
                console.error(
                    `Failed to send password reset email to ${email}:`,
                    emailError
                );
            });

        // EmailResponseDto equivalent structure
        return {
            success: true,
            message: 'Si el email existe, se ha enviado un enlace de recuperación',
            data: { email, initiated: true },
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        };
    } catch (error) {
        console.error('Error en forgotPasswordHelper:', error);
        // Por seguridad, no revelamos errores internos
        // EmailResponseDto equivalent structure
        return {
<<<<<<< HEAD
        success: true,
        message: 'Si el email existe, se ha enviado un enlace de recuperación',
        data: { email, initiated: true },
=======
            success: true,
            message: 'Si el email existe, se ha enviado un enlace de recuperación',
            data: { email, initiated: true },
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        };
    }
};

export const resetPasswordHelper = async (token, newPassword) => {
    try {
        // Verify simple token format (not JWT anymore, matching .NET)
        if (!token || typeof token !== 'string' || token.length < 40) {
<<<<<<< HEAD
        throw new Error('Token inválido para reset de contraseña');
=======
            throw new Error('Token inválido para reset de contraseña');
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        }

        // Find user by password reset token (like .NET does)
        const user = await findUserByPasswordResetToken(token);
        if (!user) {
<<<<<<< HEAD
        throw new Error('Usuario no encontrado o token inválido');
=======
            throw new Error('Usuario no encontrado o token inválido');
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        }

        // Verificar que el token no haya expirado (ya se verifica en jwt.verify, pero por seguridad)
        const userPasswordReset = user.UserPasswordReset;
        if (!userPasswordReset || !userPasswordReset.PasswordResetToken) {
<<<<<<< HEAD
        throw new Error('Token de reset inválido o ya utilizado');
=======
            throw new Error('Token de reset inválido o ya utilizado');
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        }

        // Hash de la nueva contraseña
        const { hashPassword } = await import('../utils/password-utils.js');
        const hashedPassword = await hashPassword(newPassword);

        // Actualizar contraseña y limpiar token
        await updateUserPassword(user.Id, hashedPassword);

        // Enviar email de confirmación
        try {
<<<<<<< HEAD
        const { sendPasswordChangedEmail } = await import('./email-service.js');
        // Enviar email en background; no bloquear la respuesta
        Promise.resolve()
            .then(() => sendPasswordChangedEmail(user.Email, user.Name))
            .catch((emailError) => {
            console.error('Error sending password changed email:', emailError);
            });
        } catch (emailError) {
        console.error('Error scheduling password changed email:', emailError);
        // No fallar la operación por error de email
=======
            const { sendPasswordChangedEmail } = await import('./email-service.js');
            // Enviar email en background; no bloquear la respuesta
            Promise.resolve()
                .then(() => sendPasswordChangedEmail(user.Email, user.Name))
                .catch((emailError) => {
                    console.error('Error sending password changed email:', emailError);
                });
        } catch (emailError) {
            console.error('Error scheduling password changed email:', emailError);
            // No fallar la operación por error de email
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        }

        // EmailResponseDto equivalent structure
        return {
<<<<<<< HEAD
        success: true,
        message: 'Contraseña actualizada exitosamente',
        data: { email: user.Email, reset: true },
=======
            success: true,
            message: 'Contraseña actualizada exitosamente',
            data: { email: user.Email, reset: true },
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        };
    } catch (error) {
        console.error('Error en resetPasswordHelper:', error);

        if (error.name === 'JsonWebTokenError') {
<<<<<<< HEAD
        throw new Error('Token de reset inválido');
        } else if (error.name === 'TokenExpiredError') {
        throw new Error('Token de reset expirado');
=======
            throw new Error('Token de reset inválido');
        } else if (error.name === 'TokenExpiredError') {
            throw new Error('Token de reset expirado');
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
        }

        throw error;
    }
<<<<<<< HEAD
};
=======
};
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
