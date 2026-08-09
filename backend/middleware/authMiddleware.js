import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { memoryStore } from '../seed/seedData.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'projectxia_super_secret_jwt_key_2026');

      // Try finding user in database, fallback to memoryStore
      let user = null;
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        user = null;
      }

      if (!user) {
        user = memoryStore.users.find(u => u._id === decoded.id || u.id === decoded.id || u.email === decoded.email);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Security Alert: User token invalid or account revoked.',
        });
      }

      if (user.isBanned) {
        return res.status(403).json({
          success: false,
          message: 'Access Blocked: Account flagged and quarantined by Anti-Fraud Shield.',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Security token expired or signature mismatch.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Missing cryptographic Bearer token.',
    });
  }
};

// Strict check: Only theprojectxia@gmail.com is authorized for Super Admin clearance
export const authorizeOwner = (req, res, next) => {
  if (!req.user || req.user.email.toLowerCase() !== 'theprojectxia@gmail.com') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Super Admin clearance is strictly restricted exclusively to theprojectxia@gmail.com.',
    });
  }
  next();
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

export const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'projectxia_super_secret_jwt_key_2026');
      let user = null;
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        user = null;
      }
      if (!user) {
        user = memoryStore.users.find(u => u._id === decoded.id || u.id === decoded.id || u.email === decoded.email);
      }
      if (user && !user.isBanned) {
        req.user = user;
      }
    } catch (e) {}
  }
  next();
};

export const authorize = authorizeRoles;

