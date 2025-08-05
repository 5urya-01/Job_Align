const mongoose = require("mongoose");

const TopicSchema = new mongoose.Schema({
  topicName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  score: {
    type: Number,
    default: null,
  },
});

const SkillSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  topics: {
    type: [TopicSchema],
    default: [],
  },
});

const dreamRoadMapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    dreamRole: {
      type: String,
      required: true,
    },
    skills: {
      type: [SkillSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("dreamRoadMap", dreamRoadMapSchema);
