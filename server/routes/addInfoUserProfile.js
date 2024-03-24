//update user profile

//imports
const express = require('express');
const router = express.Router();
const userModel = require('../schema/users');

//personal details
router.post('/personalDetail', (req,res) => {
    if(req.body.username && (req.body.firstName || req.body.lastName || req.body.location || req.body.bio || req.body.contact)){
        userModel.findOne({'personalDetail.username' : req.body.username}).exec()
        .then((data => {
            if(data === null) {
                res.json("User not found")
            }
            else {
                userModel.findOneAndUpdate(
                    {'personalDetail.username' : req.body.username},
                    {$set: {'personalDetail.firstName' : req.body.firstName, 'personalDetail.lastName' : req.body.lastName, 'personalDetail.location' : req.body.location, 'personalDetail.bio' : req.body.bio}}
                )
                .then(updatedUser => {
                    res.json("Updated")
                })
                .catch(error => {
                    res.json("Something went wrong")
                })
            }
        }))
        .catch((error) => {
            res.json("Error")
        })
    }
    else {
        res.json("User not authenticated")
    }
})

// Endpoint to add college detail
router.post('/collegeDetail', (req, res) => {
    const { username, collegeName, collegeLocation, branch, year, stream } = req.body;
    if (username && collegeName && (collegeLocation || branch || year || stream)) {
        userModel.findOne({ 'personalDetail.username': username })
            .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found!' });
            }
            else if (!user.collegeDetail || Object.keys(user.collegeDetail).length === 0 || user.collegeDetail.every(college => !college.isValid)) { // Check for empty object
                const newData = {
                    collegeName,
                    collegeLocation,
                    branch,
                    stream,
                    year
                };
                return userModel.updateOne({ 'personalDetail.username': username }, { $push: { collegeDetail: newData } }, { new: true })
                .then(updatedUser => {
                    res.json({ message: 'College detail added successfully!', data: updatedUser.collegeDetail });
                })
                .catch(error => {
                    res.status(500).json({message : 'Some error occured', error : error.message});
                })
            } 
            else {
                res.json({ message: 'College detail already added.' });
            }
        })
        .catch(error => res.status(500).json({ message: 'Error checking/adding college detail', error: error.message }));
    } 
    else if (!collegeName) {
        res.json({ message: 'College Name is required!' });
    } 
    else {
        res.json({ message: 'User not authenticated' });
    }
});
  
  

//add skills (only add '+')
router.post('/addSkills', (req, res) => {
    const {username, skill, experience} = req.body;
    if (username && skill && experience) {
        userModel.findOne({ 'personalDetail.username': username }).exec()
        .then(userfound => {
        if (!userfound) {
            return res.status(404).json({ message: 'User not found!' });
        } 
        else {
            // Check if the skill already exists for the user
            const existingSkill = userfound.skillDetail.find(skillItem => skillItem.skill === skill);
            if (existingSkill && existingSkill.isValid) {
                return res.status(400).json({ message: 'Skill already exists!' });
            } 
            else{
                const newData = {
                    skill,
                    experience,
                };
                return userModel.updateOne({ 'personalDetail.username': username }, { $push: { skillDetail: newData } },{ new: true })
                .then(updatedData => {
                    res.json({ message: 'New skill added successfully!', data: updatedData.skillDetail });
                })
                .catch(error => {
                    res.status(500).json({ message: 'Some error occured', error: error.message });
                });
            }
        }})
        .catch(error => {
            res.json(error.message);
        });
    } 
    else if(!username){
        res.json("User not authenticated!");
    }
    else {
        res.json("All fields required!");
    }
})

// Add certificate details
router.post('/addCertificates', (req, res) => {
    const { username, certificateName, organization, issueDate, expiryDate, credentialLink } = req.body;
    if (username && certificateName && organization && issueDate && credentialLink) {
        userModel.findOne({ 'personalDetail.username': username }).exec()
        .then(userfound => {
            if (!userfound) {
                return res.status(404).json({ message: 'User not found!' });
            } 
            else {
                const newCertificate = {
                    certificateName,
                    organization,
                    issueDate: new Date(issueDate), //(YYYY-MM-DD) string
                    expiryDate: expiryDate ? new Date(expiryDate) : null,  //(YYYY-MM-DD) string
                    credentialLink,
                };
                return userModel.updateOne(
                {'personalDetail.username': username},
                { $push: {certificationDetail: newCertificate}},
                {new: true})
                .then(updatedData => {
                    res.json({ message: 'New certificate added successfully!', data: updatedData.certificationDetail });
                })
                .catch(error => {
                    res.status(500).json({ message: 'Some error occured', error: error.message });
                });
            }
        })
        .catch(error => {
          res.json(error.message);
        });
    } 
    else {
        res.json("All fields required!");
    }
});
  
//add project details
router.post('/addProject', (req, res) => {
    const { username, projectName, description, projectLink} = req.body;
    if (username && projectName && description) {
        userModel.findOne({ 'personalDetail.username': username }).exec()
        .then(userfound => {
            if (!userfound) {
                return res.status(404).json({ message: 'User not found!' });
            } 
            else {
                const newProject = {
                    projectName,
                    description,
                    projectLink
                };
                return userModel.updateOne(
                {'personalDetail.username': username},
                { $push: {projectDetail: newProject}},
                {new: true})
                .then(updatedData => {
                    res.json({ message: 'New project added successfully!', data: updatedData.projectDetail });
                })
                .catch(error => {
                    res.status(500).json({ message: 'Some error occured', error: error.message });
                });
            }
        })
        .catch(error => {
          res.json(error.message);
        });
    } 
    else {
        res.json("All fields required!");
    }
});

module.exports = router














/* 

*/