const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var assessmentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mentor: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  created_at: Date,
  deadline: {type: Date, required: true}
});

module.exports = mongoose.model("Assessment", assessmentSchema);
