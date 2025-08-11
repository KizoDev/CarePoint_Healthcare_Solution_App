// middleware/roleMiddleware.js

// Generic reusable role checker
export const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: `Access denied. Allowed roles: ${allowedRoles.join(", ")}.`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Role verification failed.",
        error,
      });
    }
  };
};

// Existing explicit role checks (using the generic one internally)
export const isSuperAdmin = roleMiddleware(["super_admin"]);
export const isScheduler = roleMiddleware(["scheduler"]);
export const isAuthorizationAdmin = roleMiddleware(["authorization"]);
