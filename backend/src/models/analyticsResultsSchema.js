const mongoose = require("mongoose");

const analyticResultsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobId :{
    type:Number,
    required:true
  },
  result: {
    type:String,
    required:true
  }
},{
    timestamps: true
}
);

module.exports = mongoose.model('analyticsSchema', analyticResultsSchema);

