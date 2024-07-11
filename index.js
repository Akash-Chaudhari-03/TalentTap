// imports
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const registerNewUser = require('./server/routes/register');
const loginUser = require('./server/routes/login');
// const updateUserProfile = require('./server/routes/addInfoUserProfile');
const deleteInfoUserProfile = require('./server/routes/deleteInfoUserProfile');
const getUserDetails = require('./server/routes/getUserDetails');
const editUserDetails = require('./server/routes/editInfoUserProfile');

//add details api import
const addPersonalDetail = require('./server/routes/addUserInfo/personalInfo');
const addCollegeDetail = require('./server/routes/addUserInfo/collegeDetail');
const addSkills = require('./server/routes/addUserInfo/skills');
const addCertificate = require('./server/routes/addUserInfo/certificate');
const addProjects = require('./server/routes/addUserInfo/projects');



const app = express();
const PORT = 3000;

//connecting with mongodb compass locally
mongoose.connect('mongodb://127.0.0.1/TalentTap')
    .then(()=>console.log("Connected to database successfully!"))
    .catch((error)=>res.json(error.message))

//middleware
app.use(bodyParser.text());
app.use(express.json());
const cors = require("cors");
app.use(cors());

//routes
app.use('/register', registerNewUser);
app.use('/login', loginUser);
app.use('/userInfo', getUserDetails);

//route calls for adding details
app.use('/userInfo/addDetails/personalInfo', addPersonalDetail);
app.use('/userInfo/addDetails/collegeDetail', addCollegeDetail);
app.use('/userInfo/addDetails/skills', addSkills);
app.use('/userInfo/addDetails/certificate', addCertificate);
app.use('/userInfo/addDetails/project', addProjects);


app.use('/userInfo/deleteDetails', deleteInfoUserProfile);
app.use('/userInfo/editDetails', editUserDetails);

//listening to server at port
app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`));