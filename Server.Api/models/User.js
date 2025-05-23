const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  gender: { type: String, required: true, enum: ['male', 'female'] },
  role: { type: String, enum: ['admin', 'user'], default: 'user', required: true }
})

module.exports = mongoose.model('User', UserSchema)
