// imports
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const registerNewUser = require('./server/routes/register');
const loginUser = require('./server/routes/login');

const app = express();
const PORT = 3000;

//connecting with mongodb compass locally
mongoose.connect('mongodb://127.0.0.1/TalentTap')
    .then(()=>console.log("Connected to database successfully!"))

//middleware
app.use(bodyParser.text());
app.use(express.json());

//routes
app.use('/register', registerNewUser);
app.use('/login', loginUser);

//listening to server at port
app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`));