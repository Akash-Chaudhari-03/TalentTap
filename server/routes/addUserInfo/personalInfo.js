const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const logger = require('../../../logger'); 
const verifyToken = require('../verifytokens');

// Personal details endpoint with JWT middleware and logging
router.post('/', verifyToken, (req, res) => {
    const { username, firstName, lastName, location, bio, contact } = req.body;

    if (!username || !(firstName || lastName || location || bio || contact)) {
        logger.warn('Missing required fields in the request body');
        return res.status(400).json({ error: "Missing required fields" });
    }

    userModel.findOneAndUpdate(
        { 'personalDetail.username': req.user.username }, // Fetch user based on decoded JWT data
        { $set: { 'personalDetail.firstName': firstName, 'personalDetail.lastName': lastName, 'personalDetail.location': location, 'personalDetail.bio': bio, 'personalDetail.contact': contact } }, // Add contact update
        { new: true } // Return the updated document
    )
    .then(updatedUser => {
        if (!updatedUser) {
            logger.warn(`User not found for username: ${req.user.username}`);
            return res.status(404).json({ error: "User not found" });
        }
        logger.info(`User details updated for username: ${req.user.username}`);
        res.status(200).json({ message: "User details updated!"});
    })
    .catch(error => {
        logger.error(`Error updating user details for username: ${req.user.username}, Error: ${error.message}`);
        res.status(500).json({ error: "Something went wrong" });
    });
});

module.exports = router;