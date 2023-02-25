import app from './config/app'
import colors from 'colors'
import { seedData } from './config/seeds/seeder.seed'
import connectDB from './config/db'
import { getMemoryStats, getHeapSize } from './utils/memory.util'
import { unlockUserAccounts } from './jobs/user.job'


const connect = async (): Promise<void> => {
    // connect to DB
    await connectDB();

    // get heap statistics and log heap size
    const heapSize = getMemoryStats()
    console.log(heapSize);

    // seed data
    await seedData();


    // run every 0 seconds of every 30th minute of every hour of every day of month of every month of every day of week
    unlockUserAccounts('0 */30 * * * *')

}

connect();  // initialize connection and seed data

// define PORT
const PORT = process.env.PORT || 9000;

// create server
const server = app.listen(PORT, () => {
    console.log(colors.yellow.bold(`Auth service running in ${process.env.NODE_ENV} mode on port ${PORT}`))
})

// catch unhandled promise rejections
process.on('unhandledRejection', (err: any, promise) => {
    console.log(colors.red.bold(`err: ${err.message}`));
    server.close(() => process.exit(1));
}) 

