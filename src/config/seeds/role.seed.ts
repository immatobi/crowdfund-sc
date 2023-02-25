import fs from 'fs'
import colors from 'colors'

import Role from '../../models/Role.model'

// read in the JSON file
const roles = JSON.parse(
    fs.readFileSync(`${__dirname.split('config')[0]}_data/roles.json`, 'utf-8')
)

export const seedRoles = async (): Promise<void> => {

    try {

        const r = await Role.find({}); 
        if(r && r.length > 0) return;

        const seed = await Role.create(roles);

        if(seed){
            console.log(colors.green.inverse('Roles seeded successfully'))
        }
        
    } catch (err) {

        console.log(colors.red.inverse(`${err}`))
        
    }

}