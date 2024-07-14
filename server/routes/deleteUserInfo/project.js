const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users'); // Correct the relative path if necessary
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger');
const verifyToken = require('../utils/verifytokens'); // Correct the relative path if necessary

// Delete project API with token verification and validations
router.post('/', [
    verifyToken, // Token verification middleware
    body('username').notEmpty().withMessage('Username is required'),
    body('project_id').notEmpty().withMessage('Project ID is required'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, project_id } = req.body;

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

        // Find the index of the project to mark as invalid
        const projectIndex = userFound.projectDetail.findIndex(
            (project) => project.project_id === project_id && project.isValid
        );

        if (projectIndex !== -1) {
            userFound.projectDetail[projectIndex].isValid = false;
            await userFound.save()
                .then(() => {
                    logger.info(`Project marked as invalid for username: ${username}, project_id: ${project_id}`);
                    res.json({ message: 'Project marked as invalid.' });
                })
                .catch((error) => {
                    logger.error(`Error saving user document for username: ${username}, project_id: ${project_id}, Error: ${error.message}`);
                    res.status(500).json({ error: 'Internal server error' });
                });
        } else {
            logger.error(`Project not found or already invalid for username: ${username}, project_id: ${project_id}`);
            return res.status(400).json({ message: 'Project does not exist or is already deleted.' });
        }
    } catch (error) {
        logger.error(`Error finding user or marking project as invalid for username: ${username}, project_id: ${project_id}, Error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
