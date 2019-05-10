const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');

const simplifyError = require(path.join(__dirname, 'lib', 'error-simple.js'));

// Connect to redis
require(path.join(__dirname, 'cache', 'redis.js'));

// Setup passport
require(path.join(__dirname, 'middlewares', 'passport.js'))(passport);

// Routes
const indexRouter = require(path.join(__dirname, 'routes', 'index'));
const userRouter = require(path.join(__dirname, 'routes', 'user'));
const storeRouter = require(path.join(__dirname, 'routes', 'store'));
const adminRouter = require(path.join(__dirname, 'routes', 'admin'));
const marketRouter = require(path.join(__dirname, 'routes', 'market'));
const contractRouter = require(path.join(__dirname, 'routes', 'contract'));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));


app.use(cookieParser());

const MemoryStore = session.MemoryStore;
app.use(session({
  name: 'shession',
  secret: 'grasshopper',
  resave: true,
  saveUninitialized: true,
  store: new MemoryStore(),
  cookie: {maxAge: 2*60*60*1000, httpOnly: true, secure: false},
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(passport.initialize());


app.use('/api', indexRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/store', storeRouter);
app.use('/api/market', marketRouter);
app.use('/api/contract', contractRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log('ErrorHandler');
  console.log(err);
  res.status(err.status || 500);
  res.json(simplifyError(err));
});

process.on('uncaughtException', function(err) {
  console.log('Caught a serious exception: ');
  console.log(err);
  if (err.message.substr(0, 12) == 'VM Exception') {
    console.log('Solidity error');
  } else {
    process.exit(1);
  }
});

module.exports = app;
