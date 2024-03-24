//update user profile

//imports
const express = require('express');
const router = express.Router();
const userModel = require('../schema/users');

//delete skills
router.post('/deleteSkill', (req, res) => {
    if (req.body.username && req.body._id) {
        userModel.findOne({ 'personalDetail.username': req.body.username })
        .then((userFound) => {
            if (!userFound) {
                return res.status(400).json({ message: 'User not found!' });
            } 
            else {
                // Find all skills with the same _id and isValid: true (using filter (HOF))
                const skillsToUpdate = userFound.skillDetail.filter((skillObject) => req.body._id === (skillObject._id.toString()) && skillObject.isValid);
                // res.json(skillsToUpdate)
                if (skillsToUpdate.length === 0) {
                    return res.status(404).json({ message: 'Skill not found!' });
                }
                // Update isValid for each skill in the filtered array
                skillsToUpdate.forEach((skill) => (skill.isValid = false));
                return userFound.save()
                .then((updatedUser) => {
                    res.json({ message: 'Skill deleted!' });
                })
                .catch((error) => {
                    res.status(500).json({ message: 'Some error occured', error: error.message });
                });
            }
        })
        .catch((error) => {
            res.json(error.message);
        });
    }
    else {
        res.json({ message: "User not authenticated!" });
    }
});

//delete certification

  
module.exports = router