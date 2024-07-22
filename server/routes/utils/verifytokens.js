const jwt = require('jsonwebtoken');
const logger = require('../../../logger');
const path = require('path');

// Manually set the filename for logging purposes
const fileName = path.basename(__filename);

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        logger.error({ message: 'Unauthorized: Token not provided', filename: fileName });
        return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        logger.error({ message: 'Unauthorized: Token format invalid', filename: fileName });
        return res.status(401).json({ error: 'Unauthorized: Token format invalid' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            logger.error({ message: `JWT verification failed: ${err.message}`, filename: fileName });
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;
