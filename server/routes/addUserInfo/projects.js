const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger');
const generateUniqueId = require('../utils/generateId');
const verifyToken = require('../utils/verifytokens');

// Endpoint to add project details
router.post('/', verifyToken, [
    // Validate inputs using express-validator
    body('username').notEmpty().withMessage('Username is required'),
    body('projectName').notEmpty().withMessage('Project Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('projectLink').optional({ nullable: true }).isURL().withMessage('Project Link must be a valid URL'),
], (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors while adding project:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, projectName, description, projectLink } = req.body;

    userModel.findOne({ 'personalDetail.username': username }).exec()
        .then(userfound => {
            if (!userfound) {
                logger.warn(`User not found: ${username}`);
                return res.status(404).json({ message: 'User not found!' });
            } else {
                // Generate project_id using generateUniqueId function
                const project_id = generateUniqueId('PROJ', username);

                const newProject = {
                    project_id,
                    projectName,
                    description,
                    projectLink
                };

                return userModel.updateOne(
                    { 'personalDetail.username': username },
                    { $push: { projectDetail: newProject } }
                )
                .then(() => {
                    logger.info(`New project added successfully for username: ${username}`);
                    res.json({ message: 'New project added successfully!' });
                })
                .catch(error => {
                    logger.error(`Error adding project for username: ${username}, Error: ${error.message}`);
                    res.status(500).json({ message: 'Error adding project', error: error.message });
                });
            }
        })
        .catch(error => {
            logger.error(`Error finding user for username: ${username}, Error: ${error.message}`);
            res.status(500).json({ message: 'Error finding user', error: error.message });
        });
});

module.exports = router;
