const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger');
const verifyToken = require('../utils/verifytokens');
const path = require('path');

// Manually set the filename for logging purposes
const filename = path.basename(__filename);

// Delete college detail API with token verification and validations
router.post('/', [
    verifyToken, // Token verification middleware
    body('userID').notEmpty().withMessage('UserID is required'),
    body('college_id').notEmpty().withMessage('College ID is required'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userID, college_id } = req.body;

    try {
        // Find the user by userID
        const userFound = await userModel.findOne({ 'personalDetail.userID': userID });

        if (!userFound) {
            logger.error({ message: `User not found for userID: ${userID}`, filename });
            return res.status(400).json({ error: 'User not found!' });
        }

        // Verify if the authenticated user matches the request user
        if (req.user.userID !== userID) {
            logger.error({ message: `Unauthorized access: JWT token does not match userID`, filename });
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        // Find the index of the college detail to mark as invalid
        const collegeIndex = userFound.collegeDetail.findIndex(
            (college) => college.college_id.toString() === college_id && college.isValid
        );

        if (collegeIndex !== -1) {
            userFound.collegeDetail[collegeIndex].isValid = false;
            await userFound.save();
            logger.info({ message: `College detail marked as invalid for userID: ${userID}, college_id: ${college_id}`, filename });
            res.json({ message: 'College deleted!' });
        } else {
            logger.error({ message: `College detail not found or already invalid for userID: ${userID}, college_id: ${college_id}`, filename });
            return res.status(400).json({ message: 'College not found!' });
        }
    } catch (error) {
        logger.error({ message: `Error finding user or marking college detail as invalid for userID: ${userID}, college_id: ${college_id}, Error: ${error.message}`, filename });
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
