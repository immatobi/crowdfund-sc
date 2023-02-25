import mongoose from 'mongoose'
import colors from 'colors'
import { generate } from '../utils/random.util'

const options: object = {

    useNewUrlParser: true,
    // useCreateIndex: true,
    autoIndex: true,
    keepAlive: true,
    maxPoolSize: 10,
    // bufferMaxEntries: 0,
    wtimeoutMS:60000,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    serverSelectionTimeoutMS: 60000,
    family: 4,
    // useFindAndModify: false,
    useUnifiedTopology: true

}


const connectDB = async (): Promise<void> => {

    //connect to mongoose
    const dbConn = await mongoose.connect(process.env.MONGODB_URI || '', options);
    console.log(colors.cyan.bold.underline(`Database connected: ${dbConn.connection.host}`));

}

export default connectDB;

