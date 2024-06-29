// Imports
const express = require('express');
const router = express.Router();
const userModel = require('../schema/users');
const bcrypt = require('bcrypt'); 

// Login existing user
router.post('/user', (req, res) => {
    const { id, password } = req.body;

    // Check if all required fields are present
    if (!id || !password) {
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
    userModel.findOne({ 'personalDetail.email': id }).exec()
        .then(async (data) => {
            if (data === null) {
                // If no match by email, check by username
                userModel.findOne({ 'personalDetail.username': id }).exec()
                    .then(async (data) => {
                        if (data === null) {
                            res.json({ error: "Invalid credentials!" });
                        } else {
                            // Validate password
                            const isValidPassword = await validateCredentials(data);
                            if (isValidPassword) {
                                res.json({ message: "Login successful", details: sanitizeUserDetails(data) });
                            } else {
                                res.json({ error: "Invalid credentials!" });
                            }
                        }
                    })
                    .catch((error) => res.json({ error: "Some error occurred!" }));
            } else {
                // Validate password
                const isValidPassword = await validateCredentials(data);
                if (isValidPassword) {
                    res.json({ message: "Login successful", details: sanitizeUserDetails(data) });
                } else {
                    res.json({ error: "Invalid credentials!" });
                }
            }
        })
        .catch((error) => res.json({ error: "Some error occurred!" }));
});

module.exports = router;
