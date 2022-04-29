const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gradeSchema = new Schema({
  submission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
  marks: { type: Number },
  remarks: { type: String },
});

module.exports = mongoose.model("Grade", gradeSchema);
