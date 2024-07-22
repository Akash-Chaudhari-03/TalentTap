const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const logger = require('../../../logger');
const verifyToken = require('../utils/verifytokens');
const path = require('path');

// Manually set the filename for logging purposes
const fileName = path.basename(__filename); 

router.post('/', verifyToken, async (req, res) => {
    const { userID, firstName, lastName, location, bio, contact } = req.body;

    if (!userID) {
        logger.warn({ message: 'UserID is required', filename: fileName });
        return res.status(400).json({ error: 'UserID is required' });
    }

    try {
        const userFound = await userModel.findOne({ 'personalDetail.userID': userID });
        if (!userFound || !userFound.personalDetail) {
            logger.warn({ message: `Personal details not found for userID: ${userID}`, filename: fileName });
            return res.status(404).json({ message: 'Personal details not found for the user' });
        }

        const existingPersonalDetail = userFound.personalDetail;
        if (!existingPersonalDetail.firstName && !existingPersonalDetail.lastName &&
            !existingPersonalDetail.location && !existingPersonalDetail.bio &&
            !existingPersonalDetail.contact) {
            logger.warn({ message: `No personal information present for userID: ${userID}`, filename: fileName });
            return res.status(400).json({ message: 'No personal information found to update' });
        }

        const updatedFields = {};
        if (firstName) updatedFields['personalDetail.firstName'] = firstName;
        if (lastName) updatedFields['personalDetail.lastName'] = lastName;
        if (location) updatedFields['personalDetail.location'] = location;
        if (bio) updatedFields['personalDetail.bio'] = bio;
        if (contact) updatedFields['personalDetail.contact'] = contact;

        const updatedUser = await userModel.findOneAndUpdate(
            { 'personalDetail.userID': userID },
            { $set: updatedFields },
            { new: true }
        );

        if (!updatedUser) {
            logger.warn({ message: `User not found for userID: ${userID}`, filename: fileName });
            return res.status(404).json({ message: 'User not found' });
        }

        logger.info({ message: `Personal details updated successfully for userID: ${userID}`, filename: fileName });
        res.status(200).json({ message: 'Personal details updated successfully!', user: updatedUser });
    } catch (error) {
        logger.error({ message: `Error updating personal details for userID: ${userID}, Error: ${error.message}`, filename: fileName });
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
