const mongoose = require("mongoose");

const atsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  percentage :{
    type:Number,
    required:true
  },
  strengths :{
    type:Array,
    required:true
  },
  issues :{
    type:Array,
    required:true
  },
  improvements :{
    type:Array,
    required:true
  }
},{
    timestamps: true
}
);

module.exports = mongoose.model('ats', atsSchema);

