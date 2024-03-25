const User = require('../../models/User');

const requireRole = (role) => async (req, res, next) => {
  if (!req.session.userId) {
    console.log('Access denied: User is not authenticated');
    return res.status(401).send('You are not authenticated');
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.log('Access denied: User not found');
      return res.status(404).send('User not found');
    }

    if (user.role !== role) {
      console.log(`Access denied: User does not have the required role (${role})`);
      return res.status(403).send('You do not have permission to perform this action');
    }

    next();
  } catch (error) {
    console.error('Middleware error:', error.message);
    console.error(error.stack);
    return res.status(500).send('Server error');
  }
};

module.exports = { requireRole };