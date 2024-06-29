// imports
const express = require('express');
const router = express.Router();
const userModel = require('../schema/users');
const bcrypt = require('bcrypt');
const logger = require('../../logger'); // Import Winston logger instance

// POST route to register a new user
router.post('/newUser', async (req, res) => {
    const { email, username, password, confirmPwd } = req.body;

    // Function to validate email format
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    try {
        logger.info('Registration request received.');

        // Check if all fields are provided
        if (!email || !username || !password || !confirmPwd) {
            logger.warn('Registration failed: All fields are required.');
            return res.json("All fields are required.");
        }

        // Validate email format
        if (!validateEmail(email)) {
            logger.warn('Registration failed: Invalid email format.');
            return res.json("Invalid email format.");
        }

        // Password validation function
        const validatePassword = (password) => {
            const minLength = 10;

            // Check password length
            if (password.length < minLength) {
                return "Password must be at least 10 characters long.";
            }

            // Regular expressions to check for required characters anywhere in the password
            const hasUpperCase = /[A-Z]/.test(password);
            const hasDigit = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            if (!hasUpperCase) {
                return "Password must have at least one uppercase letter.";
            }
            if (!hasDigit) {
                return "Password must have at least one numeric digit.";
            }
            if (!hasSpecialChar) {
                return "Password must have at least one special character.";
            }

            return null; // Null indicates the password is valid
        };

        // Validate the password
        const passwordValidationMessage = validatePassword(password);
        if (passwordValidationMessage) {
            logger.warn(`Registration failed: ${passwordValidationMessage}`);
            return res.json(passwordValidationMessage);
        }

        // Check if passwords match
        if (password !== confirmPwd) {
            logger.warn('Registration failed: Password and confirm password do not match.');
            return res.json("Password and confirm password do not match.");
        }

        // Check if email already exists
        const emailExists = await userModel.findOne({ 'personalDetail.email': email });
        if (emailExists) {
            logger.warn('Registration failed: Email is already registered.');
            return res.json("Email is already registered.");
        }

        // Check if username already exists
        const usernameExists = await userModel.findOne({ 'personalDetail.username': username });
        if (usernameExists) {
            logger.warn('Registration failed: Username is already taken.');
            return res.json("Username is already taken.");
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // User does not exist, create a new user
        const personalDetail = {
            'username': username,
            'email': email,
            'password': hashedPassword
        };
        const userDetail = {
            personalDetail: personalDetail,
            isAvailable: true
        };

        await userModel.create(userDetail);
        logger.info(`New user registered: ${username}`);
        res.json("New User Registered!");
    } catch (error) {
        logger.error(`Registration error: ${error.message}`);
        res.json("Oops! Some error occurred.");
    }
});

module.exports = router;
