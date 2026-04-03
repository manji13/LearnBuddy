const jwt = require('jsonwebtoken');
const User = require('../Model/User Management/UserModel.js');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'learnbuddy_secret_123');
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.userId = user._id.toString();
      req.user = user;
      return next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (req.headers['x-user-id']) {
    req.userId = req.headers['x-user-id'];
    return next();
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};
