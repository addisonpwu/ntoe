const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key_change_this'; // Should be the same as in authController

const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if not token
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied.' });
  }

  // Check if token is in the correct format: Bearer <token>
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Token is not in the correct format.' });
  }

  const token = tokenParts[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Add user from payload to request object
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

module.exports = authMiddleware;
