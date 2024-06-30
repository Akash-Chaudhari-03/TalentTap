// Middleware function to verify JWT token
const express = require('express');
const router = express.Router();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        logger.error('JWT verification failed: Token not provided');
        return res.status(401).json({ error: "Unauthorized: Token not provided" });
    }

    // Extract the token from the "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {

        if (err) {
            logger.error(`JWT verification failed: ${err.message}`);
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
        req.user = decoded; // Set decoded user information in request object
        next();
    });
};

module.exports = router