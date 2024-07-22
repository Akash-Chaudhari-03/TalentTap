const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger'); 
const verifyToken = require('../utils/verifytokens');

// Edit skill detail API with token verification and validations
router.post('/', [
    verifyToken, // Token verification middleware
    body('userID').notEmpty().withMessage('UserID is required'),
    body('skill_id').notEmpty().withMessage('skill_id is required'),
    body().custom((value, { req }) => {
        // At least one of these fields is required for update
        if (!req.body.skill && req.body.experience === undefined) {
            throw new Error('At least one field (skill, experience, isValid) is required');
        }
        return true;
    }),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userID, skill_id, skill, experience, isValid } = req.body;

    try {
        // Verify if the authenticated user matches the request user
        if (req.user.userID !== userID) {
            logger.error(`Unauthorized access: JWT token does not match userID`);
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        // Find the user by userID
        const userFound = await userModel.findOne({ 'personalDetail.userID': userID });

        if (!userFound) {
            logger.error(`User not found for userID: ${userID}`);
            return res.status(400).json({ error: 'User not found!' });
        }

        // Find the index of the skill to update
        const skillIndex = userFound.skillDetail.findIndex(skill => skill.skill_id.toString() === skill_id);

        if (skillIndex === -1) {
            logger.error(`Skill not found for skill_id: ${skill_id}`);
            return res.status(400).json({ error: 'Specified skill does not exist!' });
        }

        // Ensure the skill to update is valid
        const skillToUpdate = userFound.skillDetail[skillIndex];
        if (!skillToUpdate.isValid) {
            logger.error(`Invalid skill status for skill_id: ${skill_id}`);
            return res.status(404).json({ error: 'Specified skill is not valid!' });
        }

        // Prepare updated skill details
        const updatedSkillDetail = {};
        if (skill) updatedSkillDetail['skillDetail.$.skill'] = skill;
        if (experience !== undefined) updatedSkillDetail['skillDetail.$.experience'] = experience;
        if (isValid !== undefined) updatedSkillDetail['skillDetail.$.isValid'] = isValid;

        // Update the skill details using $set with specific fields
        const infoUpdated = await userModel.findOneAndUpdate(
            { 'personalDetail.userID': userID, 'skillDetail.skill_id': skill_id },
            { $set: updatedSkillDetail },
            { new: true }
        );

        if (!infoUpdated) {
            logger.error(`User not found for userID: ${userID}`);
            return res.status(400).json({ error: 'User not found!' });
        }

        logger.info(`Skill details updated successfully for userID: ${userID}`);
        res.json({ message: 'Skill details updated successfully!', detail: infoUpdated.skillDetail[skillIndex] });

    } catch (error) {
        logger.error(`Error updating skill for userID: ${userID}, Error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
