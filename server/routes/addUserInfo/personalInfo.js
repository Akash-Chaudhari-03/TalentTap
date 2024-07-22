const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const logger = require('../../../logger'); 
const verifyToken = require('../utils/verifytokens');
const path = require('path');

// Middleware to add filename to logger context
router.use((req, res, next) => {
    req.logFilename = path.basename(__filename);
    next();
});

// Personal details endpoint with JWT middleware and logging
router.post('/', verifyToken, async (req, res) => {
    const { userID, firstName, lastName, location, bio, contact } = req.body;

    if (!userID || !(firstName || lastName || location || bio || contact)) {
        logger.warn({ message: 'Missing required fields in the request body', filename: req.logFilename });
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const updatedUser = await userModel.findOneAndUpdate(
            { 'personalDetail.userID': userID }, // Fetch user based on userID
            { 
                $set: { 
                    'personalDetail.firstName': firstName, 
                    'personalDetail.lastName': lastName, 
                    'personalDetail.location': location, 
                    'personalDetail.bio': bio, 
                    'personalDetail.contact': contact 
                } 
            },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            logger.warn({ message: `User not found for userID: ${userID}`, filename: req.logFilename });
            return res.status(404).json({ error: "User not found" });
        }

        logger.info({ message: `User details updated for userID: ${userID}`, filename: req.logFilename });
        res.status(200).json({ message: "User details updated!" });
    } catch (error) {
        logger.error({ message: `Error updating user details for userID: ${userID}, Error: ${error.message}`, filename: req.logFilename });
        res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;
