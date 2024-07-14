const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users'); // Adjust path as necessary
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger');
const verifyToken = require('../utils/verifytokens'); // Adjust path as necessary

// Delete certification API with token verification and validations
router.post('/', [
    verifyToken, // Token verification middleware
    body('username').notEmpty().withMessage('Username is required'),
    body('certificate_id').notEmpty().withMessage('Certificate ID is required'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, certificate_id } = req.body;

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

        // Find the index of the certification to mark as invalid
        const certificationIndex = userFound.certificationDetail.findIndex(
            (cert) => cert.certificate_id.toString() === certificate_id && cert.isValid
        );

        if (certificationIndex !== -1) {
            userFound.certificationDetail[certificationIndex].isValid = false;
            await userFound.save();
            logger.info(`Certification marked as invalid for username: ${username}`);
            res.json({ message: 'Certification deleted.' });
        } else {
            logger.error(`Certification not found for certificate_id: ${certificate_id}`);
            return res.status(404).json({ error: 'Certification not found.' });
        }
    } catch (error) {
        logger.error(`Error marking certification as invalid for username: ${username}, Error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
