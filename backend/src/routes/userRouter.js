const express = require("express");
const Router = express.Router();
const { createUser, getAllUsers, userLogin, sendUserOtp, verifyUserOtp, updatePassword, updateUserDetails, updatePreferedRoles, updatePreferedLocations, updateContactDetails, getUserData, getUserFilters } = require("../controllers/userController");


Router.post("/createUser", createUser);
Router.post("/loginUser", userLogin);
Router.post("/sendOtp", sendUserOtp);
Router.post("/verifyOtp", verifyUserOtp);
Router.post("/forgotPassword", updatePassword);
Router.post("/updateUserDetails", updateUserDetails);
Router.post("/updatePreferedRoles", updatePreferedRoles);
Router.post("/updatePreferedLocations", updatePreferedLocations);
Router.post("/updateContactDetails", updateContactDetails);
Router.post("/getUserData", getUserData);
Router.post("/getUserFilters", getUserFilters);
Router.get("/all", getAllUsers);


module.exports = Router;


