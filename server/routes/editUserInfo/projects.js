const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger'); 
const verifyToken = require('../utils/verifytokens');
const generateUniqueId = require('../utils/generateId'); // Import generateUniqueId if needed

// Edit project detail API with token verification and validations
router.post('/', [
    verifyToken, // Token verification middleware
    body('userID').notEmpty().withMessage('UserID is required'),
    body('project_id').notEmpty().withMessage('project_id is required'),
    body().custom((value, { req }) => {
        if (!req.body.projectName && !req.body.description && !req.body.projectLink) {
            throw new Error('At least one field (projectName, description, projectLink) is required');
        }
        return true;
    }),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userID, project_id, projectName, description, projectLink } = req.body;

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

        // Find the index of the project to update
        const projectIndex = userFound.projectDetail.findIndex(project => project.project_id.toString() === project_id);

        if (projectIndex === -1) {
            logger.error(`Project not found for project_id: ${project_id}`);
            return res.status(400).json({ error: 'Specified project does not exist!' });
        }

        // Ensure the project to update is valid
        const projectToUpdate = userFound.projectDetail[projectIndex];
        if (!projectToUpdate.isValid) {
            logger.error(`Invalid project status for project_id: ${project_id}`);
            return res.status(404).json({ error: 'Specified project is not valid!' });
        }

        // Prepare updated project details
        const updatedProjectDetail = {};
        if (projectName) updatedProjectDetail['projectDetail.$.projectName'] = projectName;
        if (description) updatedProjectDetail['projectDetail.$.description'] = description;
        if (projectLink) updatedProjectDetail['projectDetail.$.projectLink'] = projectLink;

        // Update the project details using $set with specific fields
        const infoUpdated = await userModel.findOneAndUpdate(
            { 'personalDetail.userID': userID, 'projectDetail.project_id': project_id },
            { $set: updatedProjectDetail },
            { new: true }
        );

        if (!infoUpdated) {
            logger.error(`User not found for userID: ${userID}`);
            return res.status(400).json({ error: 'User not found!' });
        }

        logger.info(`Project details updated successfully for userID: ${userID}`);
        res.json({ message: 'Project details updated successfully!', detail: infoUpdated.projectDetail[projectIndex] });

    } catch (error) {
        logger.error(`Error updating project for userID: ${userID}, Error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
