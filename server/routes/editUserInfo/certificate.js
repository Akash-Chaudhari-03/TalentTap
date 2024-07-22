const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger');
const verifyToken = require('../utils/verifytokens');
const path = require('path');

// Manually set the filename for logging purposes
const fileName = path.basename(__filename); 

router.post('/', [
    verifyToken,
    body('userID').notEmpty().withMessage('UserID is required'),
    body('certificate_id').notEmpty().withMessage('certificate_id is required'),
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

    const { userID, certificate_id, certificateName, organization, issueDate, expiryDate, credentialLink } = req.body;

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

        // Find the certificate to update
        const certificate = userFound.certificationDetail.find(cert => cert.certificate_id === certificate_id);
        if (!certificate || !certificate.isValid) {
            logger.error({ message: `Certificate not found or invalid for certificate_id: ${certificate_id}`, filename: fileName });
            return res.status(404).json({ error: 'Specified certificate is not valid!' });
        }

        // Update certificate details
        Object.assign(certificate, {
            certificateName: certificateName || certificate.certificateName,
            organization: organization || certificate.organization,
            issueDate: issueDate || certificate.issueDate,
            expiryDate: expiryDate || certificate.expiryDate,
            credentialLink: credentialLink || certificate.credentialLink,
        });

        // Save the updated user document
        await userFound.save();

        logger.info({ message: `Certificate details updated successfully for userID: ${userID}`, filename: fileName });
        res.json({ message: 'Certificate details updated successfully!', detail: certificate });
    } catch (error) {
        logger.error({ message: `Error updating certificate for userID: ${userID}, Error: ${error.message}`, filename: fileName });
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
