//imports
const express = require('express');
const router = express.Router();
const userModel = require('../schema/users');

//login existing user
router.post('/user', (req,res) => {
    if(req.body.id && req.body.password) {
        userModel.findOne({'personalDetail.email' : req.body.id, 'personalDetail.password' : req.body.password}).exec()
        .then((data => {
            if(data == null){
                userModel.findOne({'personalDetail.username' : req.body.id, 'personalDetail.password' : req.body.password}).exec()
                .then((data => {
                    if(data == null){
                        res.json({error : "Invalid credentials!"});
                    }
                    else {
                        res.json({message : "Login successful", details : data.personalDetail})
                    }
                }))
                .catch((error) => res.json({error : "Some error occurred!"}))
            }
            else {
                res.json({message : "Login successful", details : data.personalDetail})
            }
        }))
        .catch((error) => res.json({error: "Some error occurred!"}))
    }
    else {
        res.json({error: "All fields required!"});
    }
})

module.exports = router;