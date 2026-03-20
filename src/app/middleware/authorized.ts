export const authorize = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    const user = req.user;

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden access",
      });
    }

    next();
  };
};