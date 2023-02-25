import User from '../models/User.model';
import Worker from './worker'

export const unlockUserAccounts = async (cron: any | string) => {

    // set a new worker instance
    const cronworker = new Worker();

    // set the cron exoression
    cronworker.expression = cron;
    
    // schedule the job (starts automatically with false as first parameter)
    cronworker.schedule(false, '', async () => {

        // find all users
        const users = await User.find({ isLocked: true });

        if(users.length > 0){

            // unlock the accounts
            for(let i = 0; i < users.length; i++){

                users[i].isLocked = false;
                users[i].loginLimit = 0;
                await users[i].save();

                console.log(`${users[i].email} account unlocked`);

            }

        }
        

    })


}


