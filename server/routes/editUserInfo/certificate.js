// Imports
const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger'); 
const verifyToken = require('../verifytokens');

// Edit certificate detail API with token verification and validations
router.post('/', [
    verifyToken, // Token verification middleware
    body('username').notEmpty().withMessage('Username is required'),
    body('_id').notEmpty().withMessage('_id is required'),
    body().custom((value, { req }) => {
        if (!req.body.certificateName && !req.body.organization && !req.body.issueDate && !req.body.expiryDate && !req.body.credentialLink) {
            throw new Error('At least one field (certificateName, organization, issueDate, expiryDate, credentialLink) is required');
        }
        return true;
    }),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, _id, certificateName, organization, issueDate, expiryDate, credentialLink } = req.body;

    try {
        // Verify if the authenticated user matches the request user
        if (req.user.username !== username) {
            logger.error(`Unauthorized access: JWT token does not match username`);
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        // Find the user by username
        const userFound = await userModel.findOne({ 'personalDetail.username': username });

        if (!userFound) {
            logger.error(`User not found for username: ${username}`);
            return res.status(400).json({ error: 'User not found!' });
        }

        // Find the index of the certificate to update
        const certificateIndex = userFound.certificationDetail.findIndex(cert => cert._id.toString() === _id);

        if (certificateIndex === -1) {
            logger.error(`Certificate not found for _id: ${_id}`);
            return res.status(400).json({ error: 'Specified certificate does not exist!' });
        }

        // Ensure the certificate to update is valid
        const certificateToUpdate = userFound.certificationDetail[certificateIndex];
        if (!certificateToUpdate.isValid) {
            logger.error(`Invalid certificate status for _id: ${_id}`);
            return res.status(404).json({ error: 'Specified certificate is not valid!' });
        }

        // Prepare updated certificate details
        const updatedCertificateDetail = {
            certificateName: certificateName || certificateToUpdate.certificateName,
            organization: organization || certificateToUpdate.organization,
            issueDate: issueDate || certificateToUpdate.issueDate,
            expiryDate: expiryDate || certificateToUpdate.expiryDate,
            credentialLink: credentialLink || certificateToUpdate.credentialLink,
        };

        // Update the certificate details
        const infoUpdated = await userModel.findOneAndUpdate(
            { 'personalDetail.username': username, 'certificationDetail._id': _id },
            { $set: { 'certificationDetail.$': updatedCertificateDetail } },
            { new: true }
        );

        if (!infoUpdated) {
            logger.error(`User not found for username: ${username}`);
            return res.status(400).json({ error: 'User not found!' });
        }

        logger.info(`Certificate details updated successfully for username: ${username}`);
        res.json({ message: 'Certificate details updated successfully!', detail: infoUpdated.certificationDetail[certificateIndex] });

    } catch (error) {
        logger.error(`Error updating certificate for username: ${username}, Error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
