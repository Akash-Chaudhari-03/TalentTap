const express = require('express');
const router = express.Router();
const tagModel = require('../../../schema/tags');
const userModel = require('../../../schema/users'); 
const { body, validationResult } = require('express-validator');
const logger = require('../../../../logger');
const verifyToken = require('../../utils/verifytokens');
const path = require('path');

// Manually set the filename for logging purposes
const filename = path.basename(__filename); 

// Subscribe to a tag API with token verification and validations
router.post('/subscribe', [
    verifyToken, // Token verification middleware
    body('userID').notEmpty().withMessage('UserID is required'),
    body('tagName').notEmpty().withMessage('Tag name is required'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userID, tagName } = req.body;

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

        // Find the tag by tagName
        const tagFound = await tagModel.findOne({ tagName });

        if (!tagFound) {
            logger.error({ message: `Tag not found for tagName: ${tagName}`, filename });
            return res.status(404).json({ error: 'Tag not found.' });
        }

        // Check if the user is already subscribed to the tag
        const userSubscription = tagFound.usersSubscribed.find(sub => sub.userId === userID && sub.isSubscribed);

        if (userSubscription) {
            logger.error({ message: `User already subscribed to the tag: ${tagName}`, filename });
            return res.status(400).json({ error: 'User already subscribed to the tag.' });
        }

        // Add the user to the list of subscribed users for the tag
        tagFound.usersSubscribed.push({ userId: userID, subscriptionDate: new Date(), isSubscribed: true });
        await tagFound.save();

        logger.info({ message: `User subscribed to the tag: ${tagName}`, filename });
        res.json({ message: 'User subscribed to the tag successfully.' });
    } catch (error) {
        logger.error({ message: `Error subscribing to tag for userID: ${userID}, Error: ${error.message}`, filename });
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
