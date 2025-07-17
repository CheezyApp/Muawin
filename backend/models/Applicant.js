const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cnic: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  age: { type: Number, required: true },
  address: { type: String, required: true },
  education: { type: String, required: true },
  designation: { type: String, required: true },
  branch: { type: String, required: true },
  experience: { type: String },
  cvFile: { type: mongoose.Schema.Types.ObjectId, ref: 'File' }, // Reference to uploaded CV file
  createdAt: { type: Date, default: Date.now }
});

const Applicant = mongoose.model('Applicant', applicantSchema);

module.exports = Applicant; 