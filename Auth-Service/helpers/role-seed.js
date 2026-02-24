import { Role } from '../src/auth/role.model.js';
import { ALLOWED_ROLES } from './role-constants.js';

export const seedRoles = async () => {
    for (const name of ALLOWED_ROLES) {
        await Role.findOrCreate({
<<<<<<< HEAD
        where: { Name: name },
        defaults: { Name: name },
        });
    }
};
=======
            where: { Name: name },
            defaults: { Name: name },
        });
    }
    console.log('Roles seeded successfully');
};
>>>>>>> dd6f82ae1626f4387311362a8587b9fabcd054fa
