const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const logger = require('../../../logger');
const verifyToken = require('../utils/verifytokens');
const generateUniqueId = require('../utils/generateId');
const path = require('path');

// Middleware to add filename to logger context
router.use((req, res, next) => {
    req.logFilename = path.basename(__filename);
    next();
});

// Endpoint to add college detail
router.post('/', verifyToken, (req, res) => {
    const { userID, collegeName, collegeLocation, branch, year, stream } = req.body;

    logger.info({ message: `Request to add college detail for userID: ${userID}`, filename: req.logFilename });

    if (!userID || !collegeName) {
        logger.warn({ message: 'Missing required fields in the request body', filename: req.logFilename });
        return res.status(400).json({ message: 'User ID and College Name are required!' });
    }

    userModel.findOne({ 'personalDetail.userID': userID })
        .then(user => {
            if (!user) {
                logger.warn({ message: `User not found: ${userID}`, filename: req.logFilename });
                return res.status(404).json({ message: 'User not found!' });
            }

            const hasValidCollegeDetail = user.collegeDetail && user.collegeDetail.some(college => college.isValid);
            if (hasValidCollegeDetail) {
                logger.info({ message: `User already has a valid college detail: ${userID}`, filename: req.logFilename });
                return res.status(400).json({ message: 'College detail already exists.' });
            }

            // Generate college_id using generateUniqueId function with username
            const college_id = generateUniqueId('college', user.personalDetail.username);

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
                { 'personalDetail.userID': userID },
                { $push: { collegeDetail: newData } },
                { new: true }
            )
            .then(() => {
                logger.info({ message: `College detail added successfully for userID: ${userID}`, filename: req.logFilename });
                res.status(200).json({ message: 'College detail added successfully!', data: newData });
            })
            .catch(error => {
                logger.error({ message: `Error updating college detail for userID: ${userID}, Error: ${error.message}`, filename: req.logFilename });
                res.status(500).json({ message: 'Error updating college detail', error: error.message });
            });
        })
        .catch(error => {
            logger.error({ message: `Error finding user for userID: ${userID}, Error: ${error.message}`, filename: req.logFilename });
            res.status(500).json({ message: 'Error checking/adding college detail', error: error.message });
        });
});

module.exports = router;
