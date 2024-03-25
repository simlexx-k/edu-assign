const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // Added for email encryption

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Email field remains unchanged
  role: { type: String, required: true, enum: ['teacher', 'student', 'administrator'] }
});

userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    try {
      const hash = await bcrypt.hash(user.password, 10);
      user.password = hash;
    } catch (err) {
      console.error('Error hashing password:', err);
      console.error(err.stack); // Log the entire error stack
      return next(err);
    }
  }
  if (user.isModified('email')) {
    try {
      const encryptionKey = process.env.EMAIL_ENCRYPTION_KEY; // Securely retrieve the encryption key
      if (!encryptionKey) {
        throw new Error('Encryption key for email is not set.');
      }
      const iv = crypto.randomBytes(16); // Initialization vector
      const emailCipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
      let encryptedEmail = emailCipher.update(user.email, 'utf8', 'hex');
      encryptedEmail += emailCipher.final('hex');
      user.email = iv.toString('hex') + ':' + encryptedEmail; // Store IV with the encrypted email for decryption
    } catch (err) {
      console.error('Error encrypting email:', err);
      console.error(err.stack); // Log the entire error stack
      return next(err);
    }
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    console.error('Error comparing password:', err.message);
    console.error(err.stack); // Log the entire error stack
    throw err; // Ensure errors are not silently ignored and are propagated up
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;