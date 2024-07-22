// logger.js
const winston = require('winston');
const { format } = winston;
const { combine, timestamp, printf, errors } = format;
const path = require('path');
const fs = require('fs');
const DailyRotateFile = require('winston-daily-rotate-file');

// Create logs directory if it doesn't exist
const logDir = path.resolve(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Define log format
const logFormat = combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // Include error stack trace
    printf(({ timestamp, level, message, stack, ...rest }) => {
        // Extract filename from file path
        const filename = rest.filename ? path.basename(rest.filename) : 'unknown';
        return `${timestamp} [${filename}] [${level.toUpperCase()}]: ${message}${stack ? `\n${stack}` : ''}`;
    })
);

// Create Winston logger instance
const logger = winston.createLogger({
    level: 'debug',  // Set the minimum logging level to debug for development
    format: logFormat,
    transports: [
        new winston.transports.Console(),  // Log to console
        new DailyRotateFile({
            filename: path.join(logDir, 'app_%DATE%.log'),
            datePattern: 'YYYYMMDD',  // Date pattern for naming logs
            zippedArchive: true,
            maxSize: '20m',  // Max size of each log file
            maxFiles: '14d'  // Retention period in days
        })
    ]
});

module.exports = logger;
