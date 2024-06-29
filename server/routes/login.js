// Imports
const express = require('express');
const router = express.Router();
const userModel = require('../schema/users');
const bcrypt = require('bcrypt');
const logger = require('../../logger'); // Import Winston logger instance

// Login existing user
router.post('/user', async (req, res) => {
    const { id, password } = req.body;

    try {
        logger.info(`Login request received for ID: ${id}`);

        // Check if all required fields are present
        if (!id || !password) {
            logger.warn('Login failed: All fields required.');
            return res.json({ error: "All fields required!" });
        }

        // Function to validate credentials
        const validateCredentials = (user) => {
            // Compare provided password with the hashed password in the database
            return bcrypt.compare(password, user.personalDetail.password);
        };

        // Function to sanitize the user details (excluding password)
        const sanitizeUserDetails = (user) => {
            return {
                email: user.personalDetail.email,
                username: user.personalDetail.username,
            };
        };

        // Check by email first
        const userByEmail = await userModel.findOne({ 'personalDetail.email': id }).exec();
        if (!userByEmail) {
            // If no match by email, check by username
            const userByUsername = await userModel.findOne({ 'personalDetail.username': id }).exec();
            if (!userByUsername) {
                logger.warn(`Login failed: Invalid credentials for ID: ${id}`);
                return res.json({ error: "Invalid credentials!" });
            }

            // Validate password
            const isValidPassword = await validateCredentials(userByUsername);
            if (isValidPassword) {
                logger.info(`Login successful for username: ${userByUsername.personalDetail.username}`);
                res.json({ message: "Login successful", details: sanitizeUserDetails(userByUsername) });
            } else {
                logger.warn(`Login failed: Invalid credentials for ID: ${id}`);
                res.json({ error: "Invalid credentials!" });
            }
        } else {
            // Validate password
            const isValidPassword = await validateCredentials(userByEmail);
            if (isValidPassword) {
                logger.info(`Login successful for email: ${userByEmail.personalDetail.email}`);
                res.json({ message: "Login successful", details: sanitizeUserDetails(userByEmail) });
            } else {
                logger.warn(`Login failed: Invalid credentials for ID: ${id}`);
                res.json({ error: "Invalid credentials!" });
            }
        }
    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        res.json({ error: "Some error occurred!" });
    }
});

module.exports = router;