const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is a merchant
const requireMerchant = (req, res, next) => {
  if (req.user.type !== 'merchant') {
    return res.status(403).json({ message: 'Access denied. Merchant role required.' });
  }
  next();
};

// Middleware to check if user is a collaborator
const requireCollaborator = (req, res, next) => {
  if (req.user.type !== 'collaborator') {
    return res.status(403).json({ message: 'Access denied. Collaborator role required.' });
  }
  next();
};

// Middleware to check if user is either merchant or collaborator
const requireAuthenticated = (req, res, next) => {
  if (!req.user || (req.user.type !== 'merchant' && req.user.type !== 'collaborator')) {
    return res.status(403).json({ message: 'Access denied. Authentication required.' });
  }
  next();
};

module.exports = {
  verifyToken,
  requireMerchant,
  requireCollaborator,
  requireAuthenticated,
};
