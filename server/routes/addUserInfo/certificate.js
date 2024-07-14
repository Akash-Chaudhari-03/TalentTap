// certificates.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../../schema/users');
const verifyToken = require('../utils/verifytokens');
const logger = require('../../../logger');
const generateUniqueId = require('../utils/generateId');


// Endpoint to add certificates
router.post('/', verifyToken, [
    body('username').notEmpty().withMessage('Username is required'),
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
        logger.error('Certificate validation failed', { errors: errors.array() });
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, certificateName, organization, issueDate, expiryDate, credentialLink } = req.body;

    userModel.findOne({ 'personalDetail.username': username }).exec()
        .then(userfound => {
            if (!userfound) {
                logger.warn(`User not found for username: ${username}`);
                return res.status(404).json({ message: 'User not found!' });
            } else {
                // Generate certificate_id using generateUniqueId function
                const certificate_id = generateUniqueId('certificate', username);

                // Check if the certificate already exists for the user based on certificateName, organization, and issueDate
                const existingCertificate = userfound.certificationDetail.find(cert =>
                    cert.certificateName === certificateName &&
                    cert.organization === organization &&
                    new Date(cert.issueDate).toISOString() === new Date(issueDate).toISOString()
                );

                if (existingCertificate && existingCertificate.isValid) {
                    logger.error(`Certificate already exists for username: ${username}`);
                    return res.status(400).json({ message: 'Certificate already exists!' });
                } else {
                    const newCertificate = {
                        certificate_id,
                        certificateName,
                        organization,
                        issueDate: new Date(issueDate), //(YYYY-MM-DD) string
                        expiryDate: expiryDate ? new Date(expiryDate) : null,  //(YYYY-MM-DD) string
                        credentialLink,
                        isValid: true
                    };

                    return userModel.updateOne(
                        { 'personalDetail.username': username },
                        { $push: { certificationDetail: newCertificate } },
                        { new: true }
                    )
                    .then(updatedData => {
                        logger.info(`New certificate added successfully for username: ${username}`);
                        res.status(200).json({ message: 'New certificate added successfully!', data: updatedData.certificationDetail });
                    })
                    .catch(error => {
                        logger.error(`Error updating user certificates: ${error.message}`);
                        res.status(500).json({ message: 'Some error occurred', error: error.message });
                    });
                }
            }
        })
        .catch(error => {
            logger.error(`Error finding user for username: ${username}, Error: ${error.message}`);
            res.status(500).json({ message: 'Error finding user', error: error.message });
        });
});

module.exports = router;