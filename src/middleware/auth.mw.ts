import ErrorResponse from '../utils/error.util';
import { Request, Response, NextFunction } from 'express'
import asyncHandler from '../middleware/async.mw'
import { getRolesByName } from '../utils/role.util'
import jwt, { JwtPayload } from 'jsonwebtoken'
import User from '../models/User.model'

declare global {
    namespace Express{
        interface Request{
            user?: any;
        }
    }
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        let token: string = '';

        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){

            token = req.headers.authorization.split(' ')[1];  // get token from bearer
    
        }else if(req.cookies.token){
    
            token = req.cookies.token;
    
        }

        // make sure token exists
        if(!token || token === ''){
            return next(new ErrorResponse('Invalid token', 401, ['user not authorized to access this route']))
        }

        const jwtData: any = jwt.verify(token, process.env.JWT_SECRET || '');

        req.user = await User.findOne({ _id: jwtData.id, email: jwtData.email });

        if(req.user){
            return next();
        }else{
            return next(new ErrorResponse('Invalid token', 401, ['user not authorized to access this route']))
        }
        
    } catch (err) {

        return next(new ErrorResponse('Error!', 401, ['user not authorized to access this route']))
        
    }

})

export const authorize = (roles: Array<string>) => {


    let allRoles: Array<any> = [];
	let allRolesID: Array<any> = [];

    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

        const user = req.user;

        if(!user){
            return next (new ErrorResponse('unauthorized!', 401, ['user is not signed in']))
        }


        await getRolesByName(roles).then((resp) => {
            allRoles = [...resp]
        })

        // get authorized role IDs
		const ids = allRoles.map((e) => { return e._id });

        // check if id exists
		const flag = await checkRole(ids, req.user.roles);

        if(!flag){
            return next (new ErrorResponse('unauthorized!', 401, ['user is not authorized to access this route']))
        }else{
            return next();
        }

    })

}

const checkRole = (roleIds: Array<string>, roles: Array<string>): boolean => {

    let flag: boolean = false;

    for(let i = 0; i < roleIds.length; i++){

        for(let j = 0; j < roles.length; j++){

            if(roleIds[i].toString() === roles[j].toString()){
                flag = true;
            }

        }

    }

    return flag;

}