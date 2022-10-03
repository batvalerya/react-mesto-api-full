const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../errors/UnauthorizedError');

const UNAUTHORIZED = 401;

const auth = (req, res, next) => {
  const token = req.cookies.jwt;

  let payload;

  try {
    payload = jwt.verify(token, 'SECRET');
    // res.send(payload._id);
  } catch (err) {
    next(new UnauthorizedError(UNAUTHORIZED, 'Необходима авторизация'));
  }

  req.user = payload._id;
  next();
};

module.exports = {
  auth,
};
