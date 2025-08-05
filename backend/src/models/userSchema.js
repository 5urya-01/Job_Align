const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
    },
    location: {
      type: String,
    },
    phone: {
      type: Number,
    },
    experienceLevel: {
      type: String,
      default: "fresher",
    },
    resumeUrl: {
      type: String,
    },
    atsScore: {
      type: Number,
      default: 0,
    },
    monthlyCount: {
      type: Number,
      default: 10,
    },
    preferedRoles: {
      type: Array,
      default: [],
    },
    preferedLocations: {
      type: Array,
      default: [],
    },
    dreamCompany :{
      type: String,
      // require : true
    }, 
    dreamRole :{
      type : String,
      // require : true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
