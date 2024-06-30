//update user profile

// Imports
const express = require('express');
const router = express.Router();
const userModel = require('../schema/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../../logger'); 

// Middleware function to verify JWT token
// Middleware function to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        logger.error('JWT verification failed: Token not provided');
        return res.status(401).json({ error: "Unauthorized: Token not provided" });
    }

    // Extract the token from the "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {

        if (err) {
            logger.error(`JWT verification failed: ${err.message}`);
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
        req.user = decoded; // Set decoded user information in request object
        next();
    });
};


// Personal details endpoint with JWT middleware and logging
router.post('/personalDetail', verifyToken, (req, res) => {
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


// Endpoint to add college detail
router.post('/collegeDetail', verifyToken, (req, res) => {
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

            const newData = {
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