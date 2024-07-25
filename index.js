// imports
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const registerNewUser = require('./server/routes/register');
const loginUser = require('./server/routes/login');
const getUserDetails = require('./server/routes/getUserDetails');

//add details api import
const addPersonalDetail = require('./server/routes/addUserInfo/personalInfo');
const addCollegeDetail = require('./server/routes/addUserInfo/collegeDetail');
const addSkills = require('./server/routes/addUserInfo/skills');
const addCertificate = require('./server/routes/addUserInfo/certificate');
const addProjects = require('./server/routes/addUserInfo/projects');

//edit details api import
const editPersonalDetail = require('./server/routes/editUserInfo/personalInfo');
const editCollegeDetail = require('./server/routes/editUserInfo/collegeDetail');
const editSkills = require('./server/routes/editUserInfo/skills');
const editCertificate = require('./server/routes/editUserInfo/certificate');
const editProjects = require('./server/routes/editUserInfo/projects');

//delete details api import
const deleteSkills = require('./server/routes/deleteUserInfo/skills');
const deleteCertificate = require('./server/routes/deleteUserInfo/certificate');
const deleteProject = require('./server/routes/deleteUserInfo/project');
const deleteCollegeDetail = require('./server/routes/deleteUserInfo/collegeDetail');

//search user
const importTestUsersRoute = require('./server/routes/importTestUsers'); 
const searchUsers = require('./server/routes/search');
const addusers = require('./server/routes/addusers');
const postCommunity = require('./server/routes/communityPost');

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


//route calls for editing details
app.use('/userInfo/editDetails/personalInfo', editPersonalDetail);
app.use('/userInfo/editDetails/collegeDetail', editCollegeDetail);
app.use('/userInfo/editDetails/skills', editSkills);
app.use('/userInfo/editDetails/certificate', editCertificate);
app.use('/userInfo/editDetails/project', editProjects);


//route calls for deleting details
app.use('/userInfo/deleteDetails/skills', deleteSkills);
app.use('/userInfo/deleteDetails/certificate', deleteCertificate);
app.use('/userInfo/deleteDetails/project', deleteProject);
app.use('/userInfo/deleteDetails/collegeDetail', deleteCollegeDetail);

//route for search api
app.use('/search', searchUsers);
app.use('/adduser', addusers);
app.use('/communityPost', postCommunity);


app.use('/api', importTestUsersRoute); // Use the route under /api


//listening to server at port
app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`));