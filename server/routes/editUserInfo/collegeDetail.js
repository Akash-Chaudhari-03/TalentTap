const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger');
const verifyToken = require('../utils/verifytokens');
const path = require('path');

// Manually set the filename for logging purposes
const fileName = path.basename(__filename); 

router.post('/', [
    verifyToken,
    body('userID').notEmpty().withMessage('UserID is required'),
    body('college_id').notEmpty().withMessage('College ID is required'),
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

    const { userID, college_id, collegeName, collegeLocation, branch, year, stream } = req.body;

    try {
        // Verify if the authenticated user matches the request user
        if (req.user.userID !== userID) {
            logger.error({ message: `Unauthorized access: JWT token does not match userID`, filename: fileName });
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        // Find the user by userID
        const userFound = await userModel.findOne({ 'personalDetail.userID': userID });
        if (!userFound) {
            logger.error({ message: `User not found for userID: ${userID}`, filename: fileName });
            return res.status(400).json({ error: 'User not found!' });
        }

        // Find the college detail to update
        const college = userFound.collegeDetail.find(college => college.college_id === college_id && college.isValid);
        if (!college) {
            logger.error({ message: `No valid college detail found for college_id: ${college_id}`, filename: fileName });
            return res.status(404).json({ error: 'No valid college detail found!' });
        }

        // Update college details
        Object.assign(college, {
            collegeName: collegeName || college.collegeName,
            collegeLocation: collegeLocation || college.collegeLocation,
            branch: branch || college.branch,
            year: year || college.year,
            stream: stream || college.stream,
        });

        // Save the updated user document
        await userFound.save();

        logger.info({ message: `College details updated successfully for userID: ${userID}, college_id: ${college_id}`, filename: fileName });
        res.json({ message: 'College details updated successfully!', detail: college });
    } catch (error) {
        logger.error({ message: `Error updating college details for userID: ${userID}, college_id: ${college_id}, Error: ${error.message}`, filename: fileName });
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
