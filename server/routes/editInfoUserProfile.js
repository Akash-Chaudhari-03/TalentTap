//EDIT USER DATA

//imports
const express = require('express');
const router = express.Router();
const userModel = require('../schema/users');

//edit personal details 
router.post('/editPersonalDetail', (req, res) =>{
    const {username, firstName, lastName, location, bio, contact} = req.body;
    if(username && (firstName || lastName || location || bio || contact)){
        userModel.findOne({'personalDetail.username' : username})
        .then(userFound => {
            if(!userFound){
                res.status(400).json({error : "User not found!"});
            }
            else{
                userModel.findOneAndUpdate(
                    { 'personalDetail.username': username },
                    {
                      $set: {
                        'personalDetail.firstName': firstName || userFound.personalDetail.firstName, // Preserve existing value if not provided
                        'personalDetail.lastName': lastName || userFound.personalDetail.lastName,
                        'personalDetail.location': location || userFound.personalDetail.location,
                        'personalDetail.bio': bio || userFound.personalDetail.bio,
                        'personalDetail.contact': contact || userFound.personalDetail.contact,
                      },
                    },
                    { new: true } // Return the updated document
                )
                .then((userFound) => {
                    if (!userFound) {
                    return res.status(400).json({ error: 'User not found!' });
                    }
            
                    res.json({ message: 'Personal details updated successfully!', user: userFound });
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).json({ error: 'Internal server error' });
                });
            }
        })
    }
    else{
        res.json({error : "Fields empty!"})
    }
})

//edit college detail
router.post('/collegeDetail', (req,res) => {
    const {username, _id, collegeName, collegeLocation, branch, year, stream} = req.body;
    if(username && _id && (collegeName || collegeLocation || branch || year || stream)){
        userModel.findOne({ 'personalDetail.username' : username})
        .then((userFound) => {
            if(!userFound){
                return res.status(400).json({error : "User not found!"});
            }
            const collegeIndex = userFound.collegeDetail.findIndex((college) => college._id.toString() === _id);
            if (collegeIndex === -1) {
                return res.status(400).json({ error: 'College does not exist!' });
            }
            const collegeToUpdate = userFound.collegeDetail[collegeIndex];
            if (!collegeToUpdate.isValid) {
                return res.status(404).json({ error: 'College is invalid!' });
            }
            userModel.findOneAndUpdate(
                { 'personalDetail.username': username, 'collegeDetail._id': _id },
                {
                $set: {
                    'collegeDetail.$.collegeName': collegeName || collegeToUpdate.collegeName,
                    'collegeDetail.$.collegeLocation': collegeLocation || collegeToUpdate.collegeLocation,
                    'collegeDetail.$.branch': branch || collegeToUpdate.branch,
                    'collegeDetail.$.year': year || collegeToUpdate.year,
                    'collegeDetail.$.stream': stream || collegeToUpdate.stream,
                },
                },
                { new: true })
                .then((infoUpdated) => {
                    if (!infoUpdated) {
                    return res.status(400).json({ error: 'User not found!' });
                    }
                    res.json({ message: 'College details updated successfully!', detail: infoUpdated.collegeDetail[collegeIndex] });
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).json({ error: 'Internal server error' });
                }
            );
        })
    }
    else{
        res.json({error : "Fields empty!"}); //better error message (issue)
    }
})

//edit user skills
router.post('/skillDetail', (req,res) => {
    const {username, _id, skill, experience} = req.body;
    if(username && _id && (skill || experience)){
        userModel.findOne({ 'personalDetail.username' : username})
        .then((userFound) => {
            if(!userFound){
                return res.status(400).json({error : "User not found!"});
            }
            const skillIndex = userFound.skillDetail.findIndex((skill) => skill._id.toString() === _id);
            if (skillIndex === -1) {
                return res.status(400).json({ error: 'Specified skill does not exist!' });
            }
            const skillToUpdate = userFound.skillDetail[skillIndex];
            if (!skillToUpdate.isValid) {
                return res.status(404).json({ error: 'Specified skill does not exist!' });
            }
            userModel.findOneAndUpdate(
                { 'personalDetail.username': username, 'skillDetail._id': _id },
                {
                $set: {
                    'skillDetail.$.skill': skill || skillToUpdate.skill,
                    'skillDetail.$.experience': experience || skillToUpdate.experience,
                },
                },
                { new: true })
                .then((infoUpdated) => {
                    if (!infoUpdated) {
                    return res.status(400).json({ error: 'User not found!' });
                    }
                    res.json({ message: 'Skill details updated successfully!', detail: infoUpdated.skillDetail[skillIndex] });
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).json({ error: 'Internal server error' });
                }
            );
        })
    }
    else{
        res.json({error : "Fields empty!"}); //better error message (issue)
    }
})

module.exports = router