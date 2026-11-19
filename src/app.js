const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./modules/auth/authRoutes');
const authController = require('./modules/auth/authController');
const noticeRoutes = require('./modules/notices/noticeRoutes');
const hostelRoutes = require('./modules/hostel/hostelRoutes');
const messRoutes = require('./modules/mess/messRoutes');
const academicRoutes = require('./modules/academic/academicRoutes');
const adminRoutes = require('./modules/admin/adminRoutes');
const dashboardController = require('./modules/dashboard/dashboardController');
const { requireAuth } = require('./middleware/auth');
const requireRole = require('./middleware/requireRole');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Session configuration
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('FATAL: SESSION_SECRET must be explicitly set when running in production.');
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'uniconnect_dev_fallback_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  })
);

// Global view variables (pass user to all templates)
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
});

// Root & Health check
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  res.redirect('/auth/login');
});

// Authentication Routes
app.use('/auth', authRoutes);
app.get('/profile', requireAuth, authController.getProfilePage);

// Notices Routes
app.use('/notices', noticeRoutes);

// Hostel Routes
app.use('/hostel', hostelRoutes);

// Mess Routes
app.use('/mess', messRoutes);

// Academic Routes
app.use('/academic', academicRoutes);

// Admin Routes
app.use('/admin', adminRoutes);

// Central Dashboard Router
app.get('/dashboard', requireAuth, dashboardController.getDashboardRedirect);

// Role-Specific Dashboard Routes
app.get('/dashboard/student', requireAuth, requireRole('Student'), dashboardController.getStudentDashboard);
app.get('/dashboard/faculty', requireAuth, requireRole('Faculty'), dashboardController.getFacultyDashboard);
app.get('/dashboard/warden', requireAuth, requireRole('Warden'), dashboardController.getWardenDashboard);
app.get('/dashboard/mess', requireAuth, requireRole('Mess Admin'), dashboardController.getMessDashboard);
app.get('/dashboard/admin', requireAuth, requireRole('Admin'), dashboardController.getAdminDashboard);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Page Not Found - UniConnect' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).render('errors/500', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
    user: req.session ? req.session.user : null
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(` UniConnect server running on port ${PORT}`);
    console.log(` Local URL: http://localhost:${PORT}`);
  });
}

module.exports = app;
