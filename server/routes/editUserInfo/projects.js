const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger');
const verifyToken = require('../utils/verifytokens');
const path = require('path');

const fileName = path.basename(__filename); // Get the filename

router.post('/', [
    verifyToken,
    body('userID').notEmpty().withMessage('UserID is required'),
    body('project_id').notEmpty().withMessage('project_id is required'),
    body().custom((value, { req }) => {
        if (!req.body.projectName && !req.body.projectDescription && !req.body.projectLink) {
            throw new Error('At least one field (projectName, projectDescription, projectLink) is required');
        }
        return true;
    }),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userID, project_id, projectName, projectDescription, projectLink } = req.body;

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

        // Find the project detail to update
        const project = userFound.projectDetail.find(proj => proj.project_id === project_id && proj.isValid);
        if (!project) {
            logger.error({ message: `Project not found or invalid for project_id: ${project_id}`, filename: fileName });
            return res.status(404).json({ error: 'Specified project is not valid!' });
        }

        // Update project details
        Object.assign(project, {
            projectName: projectName || project.projectName,
            projectDescription: projectDescription || project.projectDescription,
            projectLink: projectLink || project.projectLink,
        });

        // Save the updated user document
        await userFound.save();

        logger.info({ message: `Project details updated successfully for userID: ${userID}`, filename: fileName });
        res.json({ message: 'Project details updated successfully!', detail: project });
    } catch (error) {
        logger.error({ message: `Error updating project for userID: ${userID}, Error: ${error.message}`, filename: fileName });
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
