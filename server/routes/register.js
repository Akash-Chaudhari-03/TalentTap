//imports
const express = require('express');
const router = express.Router();
const userModel = require('../schema/users');

//register new user
router.post('/newUser', (req,res) => {
    if(req.body.email && req.body.username && req.body.password && req.body.confirmPwd){
        if(req.body.confirmPwd != req.body.password){
            res.json("Password does not match!");
        }
        else{
            //check if either username or email exists in db
            userModel.findOne({ $or: [{'personalDetail.email' : req.body.email}, {'personalDetail.username' : req.body.username}]}).exec()
            .then((data) => {
                if(data === null){
                    //user does not exist
                    const personalDetail = {
                        'username': req.body.username,
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
                    res.json("User Already Exists!");
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