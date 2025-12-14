const jwt = require('jsonwebtoken');
const { Agent } = require('../models');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const xAccessToken = req.headers['x-access-token'];
  const candidate = authHeader || xAccessToken || req.query.token || (req.body && req.body.token);

  if (!candidate) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  // Support formats: "Bearer <token>", "Token <token>", or raw token
  const parts = String(candidate).split(' ');
  const token = parts.length > 1 ? parts[1] : parts[0];

  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    console.log('JWT Secret being used:', jwtSecret ? 'Set' : 'Using default');
    console.log('Token being verified:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Token decoded successfully:', { id: decoded.id, type: decoded.type, email: decoded.email });
    req.user = decoded;
    
    // Backward compatibility: enrich agent token with merchantId if missing
    if (req.user && req.user.type === 'agent' && !req.user.merchantId) {
      try {
        const agentRecord = await Agent.findByPk(req.user.id);
        if (agentRecord && agentRecord.merchantId) {
          req.user.merchantId = agentRecord.merchantId;
        }
      } catch (_) {}
    }
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    console.error('Token that failed:', token.substring(0, 20) + '...');
    console.error('JWT Secret used:', process.env.JWT_SECRET ? 'Environment variable' : 'Default');
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

// Middleware to check if user is authenticated as merchant, collaborator, or agent
const requireAuthenticated = (req, res, next) => {
  if (
    !req.user ||
    (req.user.type !== 'merchant' && req.user.type !== 'collaborator' && req.user.type !== 'agent')
  ) {
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

