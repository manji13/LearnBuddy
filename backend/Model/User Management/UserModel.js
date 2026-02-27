const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  campus: { type: String, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Student', 'Employee', 'Admin'], 
    default: 'Student' 
  }
}, { timestamps: true });

// Hash password before saving
// Removed the 'next' parameter since this is an async function
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);