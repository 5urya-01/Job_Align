const express = require("express");
const Router = express.Router();
const multer = require('multer');
const {getFilteredJobs, getJobDetails, getMatchAnalyticsFromMain, getMatchAnalyticsFromTemp} = require("../controllers/jobsControllers");


const storage = multer.memoryStorage();
const upload = multer({ storage });

Router.post("/getFilteredJobs", getFilteredJobs);
Router.post("/getJobDetails", getJobDetails);
Router.post("/getMatchAnalyticsFromMain", getMatchAnalyticsFromMain);
Router.post("/getMatchAnalyticsFromTemp", upload.single('resume'), getMatchAnalyticsFromTemp);


module.exports = Router;