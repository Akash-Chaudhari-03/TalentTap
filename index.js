// imports
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const registerNewUser = require('./server/routes/register');
const loginUser = require('./server/routes/login');
const updateUserProfile = require('./server/routes/addInfoUserProfile');
const deleteInfoUserProfile = require('./server/routes/deleteInfoUserProfile');
const getUserDetails = require('./server/routes/getUserDetails');

const app = express();
const PORT = 3000;

//connecting with mongodb compass locally
mongoose.connect('mongodb://127.0.0.1/TalentTap')
    .then(()=>console.log("Connected to database successfully!"))

//middleware
app.use(bodyParser.text());
app.use(express.json());
const cors = require("cors");
app.use(cors());

//routes
app.use('/register', registerNewUser);
app.use('/login', loginUser);
app.use('/userInfo', getUserDetails);
app.use('/userInfo/addDetails', updateUserProfile);
app.use('/userInfo/deleteDetails', deleteInfoUserProfile);

//listening to server at port
app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`));