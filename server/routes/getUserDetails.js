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
            //wriite code here
            const filteredData = {
                ...data._doc, // Spread personal details
                collegeDetail: data.collegeDetail.filter(college => college.isValid), // Filter valid colleges
                certificationDetail: data.certificationDetail.filter(certification => certification.isValid), // Filter valid certifications
                projectDetail: data.projectDetail.filter(project => project.isValid), // Filter valid projects
                skillDetail: data.skillDetail.filter(skill => skill.isValid), // Filter valid skills
              };
              
              res.json(filteredData);
        }
    })
    .catch(error => res.json('Oops! Some error occured!'))
})

module.exports = router