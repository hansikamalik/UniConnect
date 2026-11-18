const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./modules/auth/authRoutes');
const noticeRoutes = require('./modules/notices/noticeRoutes');
const hostelRoutes = require('./modules/hostel/hostelRoutes');
const messRoutes = require('./modules/mess/messRoutes');
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

// Notices Routes
app.use('/notices', noticeRoutes);

// Hostel Routes
app.use('/hostel', hostelRoutes);

// Mess Routes
app.use('/mess', messRoutes);

// Central Dashboard Router
app.get('/dashboard', requireAuth, (req, res) => {
  const roleRedirects = {
    'Student': '/dashboard/student',
    'Faculty': '/dashboard/faculty',
    'Warden': '/dashboard/warden',
    'Mess Admin': '/dashboard/mess',
    'Admin': '/dashboard/admin'
  };
  const target = roleRedirects[req.session.user.role] || '/auth/login';
  res.redirect(target);
});

// Role-Specific Dashboard Routes
app.get('/dashboard/student', requireAuth, requireRole('Student'), (req, res) => {
  res.render('dashboard/student', { title: 'Student Dashboard - UniConnect' });
});

app.get('/dashboard/faculty', requireAuth, requireRole('Faculty'), (req, res) => {
  res.render('dashboard/faculty', { title: 'Faculty Dashboard - UniConnect' });
});

app.get('/dashboard/warden', requireAuth, requireRole('Warden'), (req, res) => {
  res.render('dashboard/warden', { title: 'Warden Dashboard - UniConnect' });
});

app.get('/dashboard/mess', requireAuth, requireRole('Mess Admin'), (req, res) => {
  res.render('dashboard/mess', { title: 'Mess Dashboard - UniConnect' });
});

app.get('/dashboard/admin', requireAuth, requireRole('Admin'), (req, res) => {
  res.render('dashboard/admin', { title: 'Admin Dashboard - UniConnect' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Page Not Found - UniConnect' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).render('errors/403', {
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
