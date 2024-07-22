const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger');
const generateUniqueId = require('../utils/generateId');
const verifyToken = require('../utils/verifytokens');
const path = require('path');

// Manually set the filename for logging purposes
const filename = path.basename(__filename);

// Endpoint to add project details
router.post('/', verifyToken, [
    // Validate inputs using express-validator
    body('userID').notEmpty().withMessage('UserID is required'),
    body('projectName').notEmpty().withMessage('Project Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('projectLink').optional({ nullable: true }).isURL().withMessage('Project Link must be a valid URL'),
], (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn({ message: 'Validation errors while adding project', errors: errors.array(), filename });
        return res.status(400).json({ errors: errors.array() });
    }

    const { userID, projectName, description, projectLink } = req.body;

    userModel.findOne({ 'personalDetail.userID': userID }).exec()
        .then(userfound => {
            if (!userfound) {
                logger.warn({ message: `User not found: ${userID}`, filename });
                return res.status(404).json({ message: 'User not found!' });
            } else {
                // Generate project_id using generateUniqueId function and username
                const project_id = generateUniqueId('project', userfound.personalDetail.username);

                const newProject = {
                    project_id,
                    projectName,
                    description,
                    projectLink
                };

                return userModel.updateOne(
                    { 'personalDetail.userID': userID },
                    { $push: { projectDetail: newProject } }
                )
                .then(() => {
                    logger.info({ message: `New project added successfully for userID: ${userID}`, filename });
                    res.json({ message: 'New project added successfully!' });
                })
                .catch(error => {
                    logger.error({ message: `Error adding project for userID: ${userID}, Error: ${error.message}`, filename });
                    res.status(500).json({ message: 'Error adding project', error: error.message });
                });
            }
        })
        .catch(error => {
            logger.error({ message: `Error finding user for userID: ${userID}, Error: ${error.message}`, filename });
            res.status(500).json({ message: 'Error finding user', error: error.message });
        });
});

module.exports = router;
