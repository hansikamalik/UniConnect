/**
 * Authentication Middleware
 * Ensures user is authenticated before accessing protected routes.
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  // Store intended URL to redirect after login if needed
  req.session.returnTo = req.originalUrl;
  return res.redirect('/auth/login');
}

/**
 * Guest Middleware
 * Prevents already logged-in users from viewing the login page.
 */
function requireGuest(req, res, next) {
  if (req.session && req.session.user) {
    const roleRedirects = {
      'Student': '/dashboard/student',
      'Faculty': '/dashboard/faculty',
      'Warden': '/dashboard/warden',
      'Mess Admin': '/dashboard/mess',
      'Admin': '/dashboard/admin'
    };
    const target = roleRedirects[req.session.user.role] || '/dashboard';
    return res.redirect(target);
  }
  next();
}

module.exports = {
  requireAuth,
  requireGuest
};
