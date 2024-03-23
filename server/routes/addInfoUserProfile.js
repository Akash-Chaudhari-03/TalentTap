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

//update college details
//issue : college identification for updation (~ resolved)
// router.post('/collegeDetail', (req, res) => {
//     if(req.body.username && req.body.collegeName && (req.body.collegeLocation || req.body.branch || req.body.year || req.body.stream)){
//         userModel.findOne({'personalDetail.username' : req.body.username}).exec()
//         .then((data => {
//             console.log(data.collegeDetail)
//             if(data === null){
//                 res.json("User not found!")
//             }
//             else{
//                 const newData = {
//                     'collegeName' : req.body.collegeName,
//                     'collegeLocation' : req.body.collegeLocation,
//                     'branch' : req.body.branch,
//                     'stream' : req.body.stream,
//                     'year' : req.body.year
//                 }
//                 userModel.findOne({'personalDetail.username' : req.body.username, 'collegeDetail.collegeName' : req.body.collegeName}).exec()
//                 .then(userfound => {
//                     if(userfound === null){ //if given college does not exist, push new college in the array.
//                         userModel.updateOne({'personalDetail.username' : req.body.username},
//                         {$push : {'collegeDetail' : newData}},
//                         {new : true}
//                         )
//                         .then(newDataAdded => {
//                             res.json("New College Data Pushed!")
//                         })
//                         .catch(error => {
//                             res.json("some error occured!")
//                         })
//                     }
//                     else{ //if the given college exists, add/modify the new information in that object.
//                         userModel.updateOne({'personalDetail.username' : req.body.username, 'collegeDetail.collegeName' : req.body.collegeName},
//                         {$set : {'collegeDetail.$.collegeName' : req.body.collegeName, 'collegeDetail.$.collegeLocation' : req.body.collegeLocation, 'collegeDetail.$.branch' : req.body.branch, 'collegeDetail.$.stream' : req.body.stream, 'collegeDetail.$.year' : req.body.year}},
//                         {new : true}
//                         )
//                         .then(userUpdated => {
//                             res.json("College Data Updated!")
//                         })
//                         .catch(error => {
//                             res.json(error.message)
//                         })
//                     }
//                 })
//                 .catch(error => {
//                     res.json("Some error occured!")
//                 })
//             }
//         }))
//         .catch(error => res.json("Oops! Some error occured!"))
//     }
//     else if(!req.body.collegeName){
//         res.json("College Name Required!")
//     }
//     else{
//         res.json("User not authenticated")
//     }
// })


// Endpoint to add college detail (using promises)
router.post('/collegeDetail', (req, res) => {
    const { username, collegeName, collegeLocation, branch, year, stream } = req.body;
    if (username && collegeName && (collegeLocation || branch || year || stream)) {
        userModel.findOne({ 'personalDetail.username': username })
            .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found!' });
            }
            else if (!user.collegeDetail || Object.keys(user.collegeDetail).length === 0) { // Check for empty object
                const newData = {
                    collegeName,
                    collegeLocation,
                    branch,
                    stream,
                    year
                };
                return userModel.updateOne({ 'personalDetail.username': username }, { $set: { collegeDetail: newData } }, { new: true })
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
            if (existingSkill) {
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

module.exports = router














/* 

*/