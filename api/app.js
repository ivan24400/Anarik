const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');

const simplifyError = require('./lib/error-simple');

// Connect to redis
require('./cache/redis');

// Setup passport
require('./middlewares/passport')(passport);

// Routes
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const userActionsRouter = require('./routes/user-actions');
const storeRouter = require('./routes/store');
const adminRouter = require('./routes/admin');
const marketRouter = require('./routes/market');
const contractRouter = require('./routes/contract');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));


app.use(cookieParser());
app.use(passport.initialize());


app.use('/api', indexRouter);
app.use('/api/user', userRouter);
app.use('/api/user/', userActionsRouter);
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
  res.json({success: false, msg: simplifyError(err)});
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
