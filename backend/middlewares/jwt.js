const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.generateToken = (user) => {
  const payload = {
    userId: user._id,
    username: user.username,
  };

  return jwt.sign(payload, process.env.SECRET, { expiresIn: '365d' });
}


exports.verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.SECRET);
    req.userData = { userId: decodedToken.userId, username: decodedToken.username };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Autenticazione fallita.' });
  }
}
