const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger');
const verifyToken = require('../utils/verifytokens');
const path = require('path');

// Manually set the filename for logging purposes
const filename = path.basename(__filename);

// Delete certification API with token verification and validations
router.post('/', [
    verifyToken, // Token verification middleware
    body('userID').notEmpty().withMessage('UserID is required'),
    body('certificate_id').notEmpty().withMessage('Certificate ID is required'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userID, certificate_id } = req.body;

    try {
        // Find the user by userID
        const userFound = await userModel.findOne({ 'personalDetail.userID': userID });

        if (!userFound) {
            logger.error({ message: `User not found for userID: ${userID}`, filename });
            return res.status(400).json({ error: 'User not found!' });
        }

        // Verify if the authenticated user matches the request user
        if (req.user.userID !== userID) {
            logger.error({ message: `Unauthorized access: JWT token does not match userID`, filename });
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        // Find the index of the certification to mark as invalid
        const certificationIndex = userFound.certificationDetail.findIndex(
            (cert) => cert.certificate_id.toString() === certificate_id && cert.isValid
        );

        if (certificationIndex !== -1) {
            userFound.certificationDetail[certificationIndex].isValid = false;
            await userFound.save();
            logger.info({ message: `Certification marked as invalid for userID: ${userID}`, filename });
            res.json({ message: 'Certification deleted.' });
        } else {
            logger.error({ message: `Certification not found for certificate_id: ${certificate_id}`, filename });
            return res.status(404).json({ error: 'Certification not found.' });
        }
    } catch (error) {
        logger.error({ message: `Error marking certification as invalid for userID: ${userID}, Error: ${error.message}`, filename });
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
