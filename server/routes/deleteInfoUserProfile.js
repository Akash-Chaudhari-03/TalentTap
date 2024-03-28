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
router.post('/deleteCertificate', (req, res) => {
    if (req.body.username && req.body._id) {
        userModel.findOne({ 'personalDetail.username': req.body.username })
        .then((userFound) => {
            if (!userFound) {
                return res.status(400).json({ message: 'User not found!' });
            } 
            else {
                // Find the index of the certification to mark as invalid
            const certificationIndex = userFound.certificationDetail.findIndex(
                (cert) => cert._id.toString() === req.body._id && cert.isValid
            );

            if (certificationIndex !== -1) {
                userFound.certificationDetail[certificationIndex].isValid = false;
                userFound.save()
                .then(() => res.json({ message: 'Certification marked as invalid.' }))
                .catch((error) => res.json({ error: error.message }));
            } else {
                return res.status(400).json({ message: 'Certification not found.' });
            }
            }
        })
        .catch((error) => {
            res.json(error.message);
        });
    }
    else{
        res.json({ message: "User not authenticated!" });
    }
})

//delete projects
router.post('/deleteProject', (req, res) => {
    if(req.body.username && req.body._id){
        userModel.findOne({'personalDetail.username' : req.body.username})
        .then((userFound) => {
            const projectIndex = userFound.projectDetail.findIndex(
                (project) => project._id.toString() === req.body._id && project.isValid
            );
            if (projectIndex !== -1) {
                userFound.projectDetail[projectIndex].isValid = false;
                userFound.save()
                .then(() => res.json({ message: 'Project marked as invalid.' }))
                .catch((error) => res.json({ error: error.message }));
            } 
            else {
                return res.status(400).json({ message: 'Project does not exist or is already invalid.' });
            }
        })
        .catch((error) => {
            res.json(error.message);
        });
    }
    else{
        res.json({ message : "User not authenticated!"});
    }
})

//delete college details
router.post('/deleteCollege', (req, res) => {
    if(req.body.username && req.body._id){
        userModel.findOne({ 'personalDetail.username' : req.body.username})
        .then((userFound) => {
            if(!userFound){
                return res.status(400).json({ message : "User not found!"});
            }
            else{
                const collegeIndex = userFound.collegeDetail.findIndex((college) => college._id.toString() === req.body._id && college.isValid);
                if (collegeIndex !== -1) {
                    userFound.collegeDetail[collegeIndex].isValid = false;
                    userFound.save()
                    .then(() => res.json({ message: 'College deleted!' }))
                    .catch((error) => res.json({ error: error.message }));
                } 
                else {
                    return res.status(400).json({ message: 'College not found!' });
                }
            }
        })
        .catch((error) => {
            res.json(error.message);
        });
    }
    else {
        res.json({ message: "User not authenticated!" });
    }
})

module.exports = router