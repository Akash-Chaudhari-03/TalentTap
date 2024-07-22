const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const logger = require('../../../logger'); 
const verifyToken = require('../utils/verifytokens');
const generateUniqueId = require('../utils/generateId');

// Endpoint to add skills (only add '+')
router.post('/', verifyToken, (req, res) => {
    const { userID, skill, experience } = req.body;

    if (userID && skill && experience) {
        userModel.findOne({ 'personalDetail.userID': userID }).exec()
            .then(userfound => {
                if (!userfound) {
                    logger.error(`User not found for userID: ${userID}`);
                    return res.status(404).json({ message: 'User not found!' });
                } else {
                    // Check if the skill already exists for the user
                    const existingSkill = userfound.skillDetail.find(skillItem => skillItem.skill === skill);
                    if (existingSkill && existingSkill.isValid) {
                        logger.error(`Skill already exists for userID: ${userID}`);
                        return res.status(400).json({ message: 'Skill already exists!' });
                    } else {
                        // Generate skill ID using the username
                        const skillId = generateUniqueId('skill', userfound.personalDetail.username);

                        const newData = {
                            skill_id: skillId, // Add the generated skill ID
                            skill,
                            experience,
                            isValid: true
                        };
                        return userModel.updateOne({ 'personalDetail.userID': userID }, { $push: { skillDetail: newData } }, { new: true })
                            .then(() => {
                                logger.info(`New skill added successfully for userID: ${userID}`);
                                res.json({ message: 'New skill added successfully!' });
                            })
                            .catch(error => {
                                logger.error(`Error updating user skills: ${error.message}`);
                                res.status(500).json({ message: 'Some error occurred', error: error.message });
                            });
                    }
                }
            })
            .catch(error => {
                logger.error(`Error finding user: ${error.message}`);
                res.status(500).json({ message: 'Error finding user', error: error.message });
            });
    } else {
        logger.error('All fields required!');
        res.status(400).json({ message: 'All fields required!' });
    }
});

module.exports = router;
