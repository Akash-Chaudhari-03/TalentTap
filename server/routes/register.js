//imports
const express = require('express');
const router = express.Router();
const userModel = require('../schema/users');

//register new user
router.post('/newUser', (req,res) => {
    if(req.body.email && req.body.password && req.body.firstName && req.body.lastName && req.body.confirmPwd){
        if(req.body.confirmPwd != req.body.password){
            res.json("Password does not match!");
        }
        else{
            userModel.findOne({'personalDetail.email' : req.body.email}).exec()
            .then((data) => {
                if(data === null){
                    //user does not exist
                    const personalDetail = {
                        'firstName': req.body.firstName,
                        'lastName': req.body.lastName,
                        'email': req.body.email,
                        'password' : req.body.password
                    };
                    const userDetail = {
                        personalDetail : personalDetail
                    }
                    userModel.create(userDetail);
                    res.json("New User Registered!")
                }
                else{
                    res.json("Email Already Registered!");
                }
            })
            .catch((error) => res.json("Oops! Some Error Occurred!"));
        }
    }
    else{
        res.json("All Fields Required!");
    }
})

module.exports = router;