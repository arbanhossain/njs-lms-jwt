const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
  student: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  files: {type: Array, required: true, validate: (array) => {
    return array.every(v => typeof(v) === 'string') && array.length > 0;
  }},
  assessment: {type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true},
  submission_date: Date,
  grade: {
    marks: {type: Number},
    remarks: {type: String}
  }
});

module.exports = mongoose.model("Submission", submissionSchema);
