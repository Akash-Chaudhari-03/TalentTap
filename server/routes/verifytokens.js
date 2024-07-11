const jwt = require('jsonwebtoken');
const logger = require('../../logger');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        logger.error('Unauthorized: Token not provided');
        return res.status(401).json({ error: "Unauthorized: Token not provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        logger.error('Unauthorized: Token format invalid');
        return res.status(401).json({ error: "Unauthorized: Token format invalid" });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            logger.error(`JWT verification failed: ${err.message}`);
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;
