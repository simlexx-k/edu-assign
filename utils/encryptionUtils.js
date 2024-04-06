const crypto = require('crypto');

/**
 * Decrypts an encrypted email.
 * @param {string} encryptedEmail The encrypted email with IV.
 * @returns {string} The decrypted email.
 */
function decryptEmail(encryptedEmail) {
  const [ivHex, encryptedData] = encryptedEmail.split(':');
  if (!ivHex || !encryptedData) {
    console.error('Invalid encrypted email format.');
    throw new Error('Invalid encrypted email format.');
  }

  const encryptionKey = process.env.EMAIL_ENCRYPTION_KEY;
  if (!encryptionKey) {
    console.error('EMAIL_ENCRYPTION_KEY is not set in environment variables.');
    throw new Error('EMAIL_ENCRYPTION_KEY is not set in environment variables.');
  }

  try {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
    let decryptedEmail = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedEmail += decipher.final('utf8');
    return decryptedEmail;
  } catch (error) {
    console.error('Error decrypting email:', error.message);
    console.error(error.stack); // Log the entire error stack
    throw error;
  }
}

module.exports = { decryptEmail };