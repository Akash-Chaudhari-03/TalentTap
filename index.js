// imports
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

//connecting with mongodb compass locally
mongoose.connect('mongodb://127.0.0.1/societyManagementSystem')
    .then(()=>console.log("Connected to database successfully!"))

//middleware
app.use(bodyParser.text());

//listening to server at port
app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`));