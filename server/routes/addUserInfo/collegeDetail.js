const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const logger = require('../../../logger'); 
const verifyToken = require('../verifytokens');
const generateUniqueId = require('../utils/generateId');

// Endpoint to add college detail
router.post('/', verifyToken, (req, res) => {
    const { username, collegeName, collegeLocation, branch, year, stream } = req.body;
    logger.info(`Request to add college detail for username: ${username}`);

    if (!username || !collegeName) {
        logger.warn('Missing required fields in the request body');
        return res.status(400).json({ message: 'Username and College Name are required!' });
    }

    userModel.findOne({ 'personalDetail.username': username })
        .then(user => {
            if (!user) {
                logger.warn(`User not found: ${username}`);
                return res.status(404).json({ message: 'User not found!' });
            }

            const hasValidCollegeDetail = user.collegeDetail && user.collegeDetail.some(college => college.isValid);
            if (hasValidCollegeDetail) {
                logger.info(`User already has a valid college detail: ${username}`);
                return res.status(400).json({ message: 'College detail already exist.' });
            }

            // Generate college_id using generateUniqueId function
            const college_id = generateUniqueId('college', username);

            const newData = {
                college_id,
                collegeName,
                collegeLocation,
                branch,
                stream,
                year,
                isValid: true // Mark the new college detail as valid
            };

            userModel.updateOne(
                { 'personalDetail.username': username },
                { $push: { collegeDetail: newData } },
                { new: true }
            )
            .then(updatedUser => {
                logger.info(`College detail added successfully for username: ${username}`);
                res.status(200).json({ message: 'College detail added successfully!', data: updatedUser.collegeDetail });
            })
            .catch(error => {
                logger.error(`Error updating college detail for username: ${username}, Error: ${error.message}`);
                res.status(500).json({ message: 'Error updating college detail', error: error.message });
            });
        })
        .catch(error => {
            logger.error(`Error finding user for username: ${username}, Error: ${error.message}`);
            res.status(500).json({ message: 'Error checking/adding college detail', error: error.message });
        });
});

module.exports = router;
