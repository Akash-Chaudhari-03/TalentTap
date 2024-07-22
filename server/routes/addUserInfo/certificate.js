const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../../schema/users');
const verifyToken = require('../utils/verifytokens');
const logger = require('../../../logger');
const generateUniqueId = require('../utils/generateId');
const path = require('path');

// Manually set the filename for logging purposes
const filename = path.basename(__filename);

// Endpoint to add certificates
router.post('/', verifyToken, [
    body('userID').notEmpty().withMessage('UserID is required'),
    body('certificateName').notEmpty().withMessage('Certificate name is required'),
    body('organization').notEmpty().withMessage('Organization is required'),
    body('issueDate').isISO8601().toDate().withMessage('Issue date must be a valid date in YYYY-MM-DD format').custom((value) => {
        if (new Date(value) > new Date()) {
            throw new Error('Issue date cannot be in the future');
        }
        return true;
    }),
    body('expiryDate').optional().isISO8601().toDate().withMessage('Expiry date must be a valid date in YYYY-MM-DD format').custom((value, { req }) => {
        if (value && new Date(value) <= new Date(req.body.issueDate)) {
            throw new Error('Expiry date must be later than the issue date');
        }
        return true;
    }),
    body('credentialLink').isURL().withMessage('Credential link must be a valid URL')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error({ message: 'Certificate validation failed', errors: errors.array(), filename });
        return res.status(400).json({ errors: errors.array() });
    }

    const { userID, certificateName, organization, issueDate, expiryDate, credentialLink } = req.body;

    userModel.findOne({ 'personalDetail.userID': userID }).exec()
        .then(userfound => {
            if (!userfound) {
                logger.warn({ message: `User not found for userID: ${userID}`, filename });
                return res.status(404).json({ message: 'User not found!' });
            } else {
                // Generate certificate_id using generateUniqueId function and username
                const certificate_id = generateUniqueId('certificate', userfound.personalDetail.username);

                // Check if the certificate already exists for the user based on certificateName, organization, and issueDate
                const existingCertificate = userfound.certificationDetail.find(cert =>
                    cert.certificateName === certificateName &&
                    cert.organization === organization &&
                    new Date(cert.issueDate).toISOString() === new Date(issueDate).toISOString()
                );

                if (existingCertificate && existingCertificate.isValid) {
                    logger.error({ message: `Certificate already exists for userID: ${userID}`, filename });
                    return res.status(400).json({ message: 'Certificate already exists!' });
                } else {
                    const newCertificate = {
                        certificate_id,
                        certificateName,
                        organization,
                        issueDate: new Date(issueDate),
                        expiryDate: expiryDate ? new Date(expiryDate) : null,
                        credentialLink,
                        isValid: true
                    };

                    return userModel.updateOne(
                        { 'personalDetail.userID': userID },
                        { $push: { certificationDetail: newCertificate } },
                        { new: true }
                    )
                    .then(updatedData => {
                        logger.info({ message: `New certificate added successfully for userID: ${userID}`, filename });
                        res.status(200).json({ message: 'New certificate added successfully!', data: updatedData.certificationDetail });
                    })
                    .catch(error => {
                        logger.error({ message: `Error updating user certificates: ${error.message}`, filename });
                        res.status(500).json({ message: 'Some error occurred', error: error.message });
                    });
                }
            }
        })
        .catch(error => {
            logger.error({ message: `Error finding user for userID: ${userID}, Error: ${error.message}`, filename });
            res.status(500).json({ message: 'Error finding user', error: error.message });
        });
});

module.exports = router;
