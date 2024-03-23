//DISPLAY ALL USER DETAILS IN USER PROFILE PAGE
//imports
const express = require('express');
const router = express.Router();
const userModel = require('../schema/users');

router.post('/getDetails', (req, res) => {
    userModel.findOne({'personalDetail.username' : req.body.username}).exec()
    .then(data => {
        if(data === null){
            res.json("User not found!");
        }
        else{
            res.json(data);
        }
    })
    .catch(error => res.json('Oops! Some error occured!'))
})

module.exports = router