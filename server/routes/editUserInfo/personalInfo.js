const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger'); 
const verifyToken = require('../utils/verifytokens');

// Edit personal details
router.post('/', verifyToken, (req, res) => {
    const { userID, firstName, lastName, location, bio, contact } = req.body;

    // Validate inputs
    if (!userID) {
        logger.warn('UserID is required');
        return res.status(400).json({ error: 'UserID is required' });
    }

    // Check if personal details exist for the user
    userModel.findOne({ 'personalDetail.userID': userID })
        .then(userFound => {
            if (!userFound || !userFound.personalDetail) {
                logger.warn(`Personal details not found for userID: ${userID}`);
                return res.status(404).json({ message: 'Personal details not found for the user' });
            }

            // Determine if any personal information is present
            const existingPersonalDetail = userFound.personalDetail;
            if (!existingPersonalDetail.firstName && !existingPersonalDetail.lastName &&
                !existingPersonalDetail.location && !existingPersonalDetail.bio &&
                !existingPersonalDetail.contact) {
                logger.warn(`No personal information present for userID: ${userID}`);
                return res.status(400).json({ message: 'No personal information found to update' });
            }

            // Update the personal details
            const updatedFields = {};
            if (firstName) updatedFields['personalDetail.firstName'] = firstName;
            if (lastName) updatedFields['personalDetail.lastName'] = lastName;
            if (location) updatedFields['personalDetail.location'] = location;
            if (bio) updatedFields['personalDetail.bio'] = bio;
            if (contact) updatedFields['personalDetail.contact'] = contact;

            userModel.findOneAndUpdate(
                { 'personalDetail.userID': userID },
                { $set: updatedFields },
                { new: true }
            )
            .then(updatedUser => {
                if (!updatedUser) {
                    logger.warn(`User not found for userID: ${userID}`);
                    return res.status(404).json({ message: 'User not found' });
                }
                logger.info(`Personal details updated successfully for userID: ${userID}`);
                res.status(200).json({ message: 'Personal details updated successfully!', user: updatedUser });
            })
            .catch(error => {
                logger.error(`Error updating personal details for userID: ${userID}, Error: ${error.message}`);
                res.status(500).json({ error: 'Internal server error' });
            });
        })
        .catch(error => {
            logger.error(`Error finding user for userID: ${userID}, Error: ${error.message}`);
            res.status(500).json({ error: 'Internal server error' });
        });
});

module.exports = router;
