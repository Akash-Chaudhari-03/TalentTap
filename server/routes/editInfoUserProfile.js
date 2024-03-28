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

module.exports = router