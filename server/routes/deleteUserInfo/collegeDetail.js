const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users'); // Correct the relative path if necessary
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger');
const verifyToken = require('../utils/verifytokens'); // Correct the relative path if necessary

// Delete college detail API with token verification and validations
router.post('/', [
    verifyToken, // Token verification middleware
    body('username').notEmpty().withMessage('Username is required'),
    body('college_id').notEmpty().withMessage('College ID is required'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, college_id } = req.body;

    try {
        // Find the user by username
        const userFound = await userModel.findOne({ 'personalDetail.username': username });

        if (!userFound) {
            logger.error(`User not found for username: ${username}`);
            return res.status(400).json({ error: 'User not found!' });
        }

        // Verify if the authenticated user matches the request user
        if (req.user.username !== username) {
            logger.error(`Unauthorized access: JWT token does not match username`);
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        // Find the index of the college detail to mark as invalid
        const collegeIndex = userFound.collegeDetail.findIndex(
            (college) => college.college_id.toString() === college_id && college.isValid
        );

        if (collegeIndex !== -1) {
            userFound.collegeDetail[collegeIndex].isValid = false;
            await userFound.save()
                .then(() => {
                    logger.info(`College detail marked as invalid for username: ${username}, college_id: ${college_id}`);
                    res.json({ message: 'College deleted!' });
                })
                .catch((error) => {
                    logger.error(`Error saving user document for username: ${username}, college_id: ${college_id}, Error: ${error.message}`);
                    res.status(500).json({ error: 'Internal server error' });
                });
        } else {
            logger.error(`College detail not found or already invalid for username: ${username}, college_id: ${college_id}`);
            return res.status(400).json({ message: 'College not found!' });
        }
    } catch (error) {
        logger.error(`Error finding user or marking college detail as invalid for username: ${username}, college_id: ${college_id}, Error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
