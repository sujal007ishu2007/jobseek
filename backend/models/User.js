const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['jobseeker', 'employer', 'admin'],
    default: 'jobseeker'
  },
  profile: {
    phone: String,
    location: String,
    bio: String,
    skills: [String],
    experience: String,
    education: String,
    resume: String // URL to resume file
  },
  company: {
    name: String,
    description: String,
    website: String,
    location: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
