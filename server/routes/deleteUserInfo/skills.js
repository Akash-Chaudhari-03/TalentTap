const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger');
const verifyToken = require('../utils/verifytokens');
const path = require('path');

// Manually set the filename for logging purposes
const filename = path.basename(__filename);

// Delete skill API with token verification and validations
router.post('/', [
    verifyToken, // Token verification middleware
    body('userID').notEmpty().withMessage('UserID is required'),
    body('skill_id').notEmpty().withMessage('Skill ID is required'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userID, skill_id } = req.body;

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

        // Find all valid skills with the given skill_id
        const skillsToUpdate = userFound.skillDetail.filter(
            (skillObject) => skill_id === skillObject.skill_id.toString() && skillObject.isValid
        );

        if (skillsToUpdate.length === 0) {
            logger.error({ message: `Skill not found for skill_id: ${skill_id}`, filename });
            return res.status(404).json({ error: 'Skill not found!' });
        }

        // Update isValid for each skill in the filtered array
        skillsToUpdate.forEach((skill) => (skill.isValid = false));

        // Save the updated user document
        await userFound.save();

        logger.info({ message: `Skill deleted successfully for userID: ${userID}`, filename });
        res.json({ message: 'Skill deleted!' });
    } catch (error) {
        logger.error({ message: `Error deleting skill for userID: ${userID}, Error: ${error.message}`, filename });
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
