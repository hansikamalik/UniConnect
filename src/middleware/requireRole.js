/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if authenticated user has one of the required roles.
 * Usage: requireRole('Admin') or requireRole(['Admin', 'Warden'])
 */
function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.redirect('/auth/login');
    }

    if (!roles.includes(req.session.user.role)) {
      return res.status(403).render('errors/403', {
        title: 'Access Denied',
        message: `Forbidden: You do not have permission to access this resource. Required role(s): ${roles.join(', ')}`,
        user: req.session.user
      });
    }

    next();
  };
}

module.exports = requireRole;
