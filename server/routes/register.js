//imports
const express = require('express');
const router = express.Router();
const userModel = require('../schema/users');
const bcrypt = require('bcrypt');  // Assuming bcrypt is used for hashing passwords

router.post('/newUser', async (req, res) => {
    const { email, username, password, confirmPwd } = req.body;

    // Function to validate email format
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Check if all fields are provided
    if (!email || !username || !password || !confirmPwd) {
        return res.json("All fields are required.");
    }

    // Validate email format
    if (!validateEmail(email)) {
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
        return res.json(passwordValidationMessage);
    }

    // Check if passwords match
    if (password !== confirmPwd) {
        return res.json("Password and confirm password do not match.");
    }

    try {
        // Check if email already exists
        const emailExists = await userModel.findOne({ 'personalDetail.email': email });
        if (emailExists) {
            return res.json("Email is already registered.");
        }

        // Check if username already exists
        const usernameExists = await userModel.findOne({ 'personalDetail.username': username });
        if (usernameExists) {
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
        res.json("New User Registered!");
    } catch (error) {
        res.json("Oops! Some error occurred.");
    }
});

module.exports = router;
