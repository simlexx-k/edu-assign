const csurf = require('csurf');
const cookieParser = require('cookie-parser');

// CSRF protection middleware
const csrfProtection = csurf({ cookie: true });

module.exports = {
  csrfProtection,
  cookieParser
};