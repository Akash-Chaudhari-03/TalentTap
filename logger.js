// logger.js
const winston = require('winston');
const { format } = winston;
const { combine, timestamp, printf } = format;
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
    printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
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
