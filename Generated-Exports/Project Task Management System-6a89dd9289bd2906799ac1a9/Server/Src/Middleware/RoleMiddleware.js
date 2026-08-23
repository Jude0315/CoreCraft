// This middleware checks whether the authenticated user has one of the
// roles permitted by the generated application specification.
const AllowRoles = (...roles) => {
  return (req, res, next) => {
    if (
      !req.user ||
      !roles.includes(req.user.role)
    ) {
      return res.status(403).json({
        message:
          "You do not have permission to access this resource",
      });
    }

    next();
  };
};

module.exports = AllowRoles;
