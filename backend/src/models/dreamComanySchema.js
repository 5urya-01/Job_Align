const mongoose = require("mongoose");

const dreamCompanySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      require: true,
    },
    logo: {
      type: String,
      require: true,
    },
    overview: {
      type: String,
      require: true,
    },
    topRoles: {
      type: [String],
      require: true,
      default: [],
    },
    locations: {
      type: [String],
      require: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("dreamCompany", dreamCompanySchema);
