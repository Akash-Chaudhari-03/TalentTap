// Imports
const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger'); 
const verifyToken = require('../utils/verifytokens');

// Edit college detail API with token verification and validations
router.post('/', [
    verifyToken, // Token verification middleware should be first
    body('username').notEmpty().withMessage('Username is required'),
    body('college_id').notEmpty().withMessage('College ID not found'),
    body().custom((value, { req }) => {
        if (!req.body.collegeName && !req.body.collegeLocation && !req.body.branch && !req.body.year && !req.body.stream) {
            throw new Error('At least one field (collegeName, collegeLocation, branch, year, stream) is required');
        }
        return true;
    }),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, college_id, collegeName, collegeLocation, branch, year, stream } = req.body;

    try {
        // Verify if the authenticated user matches the request user
        if (req.user.username !== username) {
            logger.error(`Unauthorized access: JWT token does not match username`);
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        // Find the user by username
        const userFound = await userModel.findOne({ 'personalDetail.username': username });

        if (!userFound) {
            logger.error(`User not found for username: ${username}`);
            return res.status(400).json({ error: "User not found!" });
        }

        // Find the college detail by college_id
        const collegeToUpdate = userFound.collegeDetail.find(college => college.college_id === college_id && college.isValid);

        if (!collegeToUpdate) {
            logger.error(`No valid college detail found for college_id: ${college_id}`);
            return res.status(404).json({ error: 'No valid college detail found!' });
        }

        // Update the college detail
        collegeToUpdate.collegeName = collegeName || collegeToUpdate.collegeName;
        collegeToUpdate.collegeLocation = collegeLocation || collegeToUpdate.collegeLocation;
        collegeToUpdate.branch = branch || collegeToUpdate.branch;
        collegeToUpdate.year = year || collegeToUpdate.year;
        collegeToUpdate.stream = stream || collegeToUpdate.stream;

        // Save the updated user document
        const infoUpdated = await userFound.save();

        logger.info(`College details updated successfully for username: ${username}, college_id: ${college_id}`);
        res.json({ message: 'College details updated successfully!', detail: infoUpdated.collegeDetail });
    } catch (error) {
        logger.error(`Error updating college details for username: ${username}, college_id: ${college_id}, Error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
