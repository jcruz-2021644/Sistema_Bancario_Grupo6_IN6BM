import { User, UserProfile, UserEmail, UserPasswordReset } from '../src/users/user.model.js';
import { Role, UserRole } from '../src/auth/role.model.js';
import { ADMIN_ROLE } from './role-constants.js';
import { hashPassword } from '../utils/password-utils.js';

export const seedDefaultAdmin = async () => {
    try {
        const ADMIN_EMAIL = 'sistemabancarioin@gmail.com';
        const ADMIN_PASSWORD = 'admin';

        // Asegurar que existe el rol ADMIN
        const [adminRole] = await Role.findOrCreate({
            where: { Name: ADMIN_ROLE },
            defaults: { Name: ADMIN_ROLE },
        });

        // Buscar usuario por email
        let user = await User.findOne({ where: { Email: ADMIN_EMAIL } });

        if (!user) {
            const hashed = await hashPassword(ADMIN_PASSWORD);
            user = await User.create({
                Name: 'Admin',
                Surname: 'Sistema Bancario',
                Username: 'sistemabancarioadmin',
                Email: ADMIN_EMAIL,
                Password: hashed,
                Status: true,
            });

            await UserProfile.create({
                UserId: user.Id,
                Phone: '00000000',
                ProfilePicture: '',
            });
            
            await UserEmail.create({ 
                UserId: user.Id, 
                EmailVerified: true 
            });
            
            await UserPasswordReset.create({ 
                UserId: user.Id 
            });

            await UserRole.create({ 
                UserId: user.Id, 
                RoleId: adminRole.Id 
            });
            
            console.log(`Admin creado exitosamente: ${ADMIN_EMAIL}`);
        } else {
            // Asegurar estado activo
            await User.update({ Status: true }, { where: { Id: user.Id } });

            // Asignar rol si no lo tiene
            const existing = await UserRole.findOne({
                where: { UserId: user.Id, RoleId: adminRole.Id },
            });
            
            if (!existing) {
                await UserRole.create({ 
                    UserId: user.Id, 
                    RoleId: adminRole.Id 
                });
                console.log(`Rol ADMIN asignado a usuario existente: ${ADMIN_EMAIL}`);
            } else {
                console.log(`Admin ya existe: ${ADMIN_EMAIL}`);
            }
        }
    } catch (err) {
        console.error('Error creando admin por defecto:', err);
        throw err;
    }
};