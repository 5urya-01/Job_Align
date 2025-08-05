// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cron = require('node-cron')
const axios = require('axios')

dotenv.config();

const app = express();

// Middleware
app.use(cors());  
app.use(bodyParser.json());
app.use(express.static('public'));


// DB Connection
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));


var userRouter = require("./src/routes/userRouter");
var jobsRouter = require("./src/routes/jobsRouter");
var resumeRouter = require("./src/routes/resumeRouter");
var dreamRoleRouter = require('./src/routes/dreamRoleRouter')


app.use('/api', userRouter);
app.use('/api', jobsRouter);
app.use('/api', resumeRouter);
app.use('/api', dreamRoleRouter);

// Sample route
app.get('/', (req, res) => {
  res.send('Welcome to JobAlign!');
});


// Server start
const port = process.env.PORT || 5000;
app.listen(port , function(){
  console.log('Server is Running at  '+'http://localhost:'+ port);
});
