import appRoot from 'app-root-path';
import { createLogger, transports, format, config } from 'winston';

const options = {

    appFile: {
        filename: `${appRoot}/src/logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    }

}

// define new logger transports
export const userLogger = createLogger({
    levels: config.syslog.levels,
    transports: [
        new transports.File(options.appFile)
    ],
    exitOnError: false
});