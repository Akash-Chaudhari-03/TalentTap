const express = require('express');
const router = express.Router();
const userModel = require('../../schema/users');
const logger = require('../../../logger'); 
const verifyToken = require('../verifytokens');

// Endpoint to add skills (only add '+')
router.post('/', verifyToken, (req, res) => {
    const { username, skill, experience } = req.body;

    if (username && skill && experience) {
        userModel.findOne({ 'personalDetail.username': username }).exec()
            .then(userfound => {
                if (!userfound) {
                    logger.error(`User not found for username: ${username}`);
                    return res.status(404).json({ message: 'User not found!' });
                } else {
                    // Check if the skill already exists for the user
                    const existingSkill = userfound.skillDetail.find(skillItem => skillItem.skill === skill);
                    if (existingSkill && existingSkill.isValid) {
                        logger.error(`Skill already exists for username: ${username}`);
                        return res.status(400).json({ message: 'Skill already exists!' });
                    } else {
                        const newData = {
                            skill,
                            experience,
                            isValid: true
                        };
                        return userModel.updateOne({ 'personalDetail.username': username }, { $push: { skillDetail: newData } }, { new: true })
                            .then(updatedData => {
                                logger.info(`New skill added successfully for username: ${username}`);
                                res.json({ message: 'New skill added successfully!', data: updatedData });
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