const express = require("express");
const Router = express.Router();

const {addDreamRole, getTopicQuestions, checkTestAnswers, getRoadMap, getCompanyData, getRoleData, getTopicTestResult} = require('../controllers/dreamRoleController')


Router.post('/addDreamRole', addDreamRole);
Router.post("/getTopicQuestions", getTopicQuestions);
Router.post("/checkTestAnswers", checkTestAnswers);
Router.post("/getRoadMap", getRoadMap);
Router.post("/getCompanyData", getCompanyData);
Router.post("/getRoleData", getRoleData);
Router.post("/getTopicTestResult", getTopicTestResult);



module.exports = Router;

