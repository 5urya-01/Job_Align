const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topicId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    response: {
      type: Array,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("testSchema", testSchema);
