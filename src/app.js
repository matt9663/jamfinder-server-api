if (process.env.NODE_ENV !== 'production') { require('dotenv').config() };
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const usersRouter = require('./users/users-router');
const bandsRouter = require('./bands/bands-router');
const authRouter = require('./auth/auth-router');
const messagesRouter = require('./band_messages/band_messages-router');

const app = express();

const morganOption = (NODE_ENV === 'production' ? 'tiny' : 'dev');

app.use(morgan((morganOption), {
  skip: () => NODE_ENV === 'test'
}));
app.use(helmet());
app.use(cors());

app.use('/api/users', usersRouter);
app.use('/api/bands', bandsRouter);
app.use('/api/auth', authRouter);
app.use('/api/messages', messagesRouter);

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.use(function errorHandler (error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.log(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
