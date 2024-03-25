// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const authRoutes = require("./routes/authRoutes");
const assignmentRoutes = require('./routes/assignmentRoutes'); // Added assignment routes
const submissionRoutes = require('./routes/submissionRoutes'); // Import submission routes
const gradingRoutes = require('./routes/gradingRoutes'); // Import grading routes
const progressRoutes = require('./routes/progressRoutes'); // Import progress routes
const subjectRoutes = require('./routes/subjectRoutes'); // Import subject routes
const reportRoutes = require('./routes/reportRoutes'); // Import report routes
const { cookieParser, csrfProtection } = require('./routes/middleware/securityMiddleware'); // Import CSRF and cookie-parser middleware

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Use cookie-parser middleware
app.use(cookieParser());

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
    cookie: { httpOnly: true, secure: false, sameSite: 'lax' } // Ensure secure cookie settings, adjusted for development on localhost
  }),
);

// Apply CSRF protection globally
app.use(csrfProtection);

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Logging session creation and destruction
app.use((req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  res.locals._csrf = req.csrfToken(); // Make CSRF token available to all views
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
});

// Authentication Routes
app.use(authRoutes);

// Assignment Routes
app.use(assignmentRoutes); // Registering the assignment routes

// Submission Routes
app.use(submissionRoutes); // Registering the submission routes

// Grading Routes
app.use(gradingRoutes); // Registering the grading routes

// Progress Routes
app.use(progressRoutes); // Registering the progress routes

// Subject Routes
app.use(subjectRoutes); // Registering the subject routes

// Report Routes
app.use(reportRoutes); // Registering the report routes

// Root path response
app.get("/", (req, res) => {
  res.render("index", { _csrf: req.csrfToken() }); // Pass CSRF token to the view
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});