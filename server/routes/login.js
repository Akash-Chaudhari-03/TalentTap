//imports
const express = require('express');
const router = express.Router();
const userModel = require('../schema/users');

//login existing user
router.post('/user', (req,res) => {
    if(req.body.email && req.body.password) {
        userModel.findOne({'personalDetail.email' : req.body.email, 'personalDetail.password' : req.body.password}).exec()
        .then((data => {
            if(data == null){
                res.json("Invalid credentials!");
            }
            else {
                res.json("Login successful!")
            }
        }))
        .catch((error) => res.json("Some error occurred!"))
    }
    else {
        res.json("All fields required!");
    }
})

module.exports = router;