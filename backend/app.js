require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const { errors, Joi, celebrate } = require('celebrate');
const { cardRouter } = require('./routes/cards');
const { NotFoundError } = require('./errors/NotFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { userRoutes } = require('./routes/users');

const { login, createUser } = require('./controllers/users');
const { auth } = require('./middlewares/auth');
const errorHandler = require('./middlewares/error');
const { validateURL } = require('./validator');

const { PORT = 3000 } = process.env;
const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://api.mesto.baturina.nomore.nomoredomains.icu',
    'https://api.mesto.baturina.nomore.nomoredomains.icu',
    'http://mesto.baturina.nomoredomains.icu',
    'https://mesto.baturina.nomoredomains.icu',
  ],
  credentials: true,
}));

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signup', express.json(), celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom(validateURL),
  }),
}), createUser);

app.post('/signin', express.json(), celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), login);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(auth);
app.use(userRoutes);
app.use(cardRouter);
app.use((req, res, next) => {
  next(new NotFoundError(404, 'Страница не найдена'));
});
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

async function main() {
  await mongoose.connect('mongodb://localhost:27017/mestodb', {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  });

  await app.listen(PORT);
}

main();
