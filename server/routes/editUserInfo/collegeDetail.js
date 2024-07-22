// Imports
const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const { body, validationResult } = require('express-validator');
const logger = require('../../../logger'); 
const verifyToken = require('../utils/verifytokens');

// Edit college detail API with token verification and validations
router.post('/', [
    verifyToken,
    body('userID').notEmpty().withMessage('UserID is required'),
    body('college_id').notEmpty().withMessage('College ID not found'),
    body().custom((value, { req }) => {
        if (!req.body.collegeName && !req.body.collegeLocation && !req.body.branch && !req.body.year && !req.body.stream) {
            throw new Error('At least one field (collegeName, collegeLocation, branch, year, stream) is required');
        }
        return true;
    }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userID, college_id, collegeName, collegeLocation, branch, year, stream } = req.body;

    try {
        if (req.user.userID !== userID) {
            logger.error(`Unauthorized access: JWT token does not match userID`, { stack: new Error().stack });
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        const userFound = await userModel.findOne({ 'personalDetail.userID': userID });

        if (!userFound) {
            logger.error(`User not found for userID: ${userID}`, { stack: new Error().stack });
            return res.status(400).json({ error: "User not found!" });
        }

        const collegeToUpdate = userFound.collegeDetail.find(college => college.college_id === college_id && college.isValid);

        if (!collegeToUpdate) {
            logger.error(`No valid college detail found for college_id: ${college_id}`, { stack: new Error().stack });
            return res.status(404).json({ error: 'No valid college detail found!' });
        }

        collegeToUpdate.collegeName = collegeName || collegeToUpdate.collegeName;
        collegeToUpdate.collegeLocation = collegeLocation || collegeToUpdate.collegeLocation;
        collegeToUpdate.branch = branch || collegeToUpdate.branch;
        collegeToUpdate.year = year || collegeToUpdate.year;
        collegeToUpdate.stream = stream || collegeToUpdate.stream;

        const infoUpdated = await userFound.save();

        logger.info(`College details updated successfully for userID: ${userID}, college_id: ${college_id}`);
        res.json({ message: 'College details updated successfully!', detail: infoUpdated.collegeDetail });
    } catch (error) {
        logger.error(`Error updating college details for userID: ${userID}, college_id: ${college_id}, Error: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;