import Role from '../models/Role.model'

export const getRolesByName = async (roles: Array<string>): Promise<any> => {

    const result = roles.map(async (r) => await Role.findByName(r));
	const authorized = Promise.all(result);
	return authorized;

}