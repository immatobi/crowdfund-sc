import Role from '../../models/Role.model'
import User from '../../models/User.model'
import colors from 'colors';


import { seedRoles } from './role.seed'
import { seedUsers } from './user.seed'
// import { syncStatus } from './update.seed'

// role functions
const attachSuperRole = async (): Promise<void> => {

    const superadmin = await User.findOne({ email: 'hello@concreap.com' });
    const role = await Role.findOne({ name: 'superadmin' });


    if(superadmin && role){

        const asRole = await superadmin.hasRole('superadmin', superadmin.roles);

        if(!asRole){

            superadmin.roles.push(role._id);
            await superadmin.save();

            console.log(colors.magenta.inverse('Superadmin role attached successfully'));

        }

    }

}

export const seedData = async (): Promise<void> => {

    await seedRoles();
    await seedUsers();

    await attachSuperRole();

}