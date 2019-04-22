const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');

// Routes
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
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

// // HTTP request body/params logger
// app.use(function (req,res,next){
//   console.log('Logger ==');
//   console.log("req.body");console.log(req.body);
//   console.log("req.query");console.log(req.query);
//   console.log('==');
//   next();
// });


app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/store', storeRouter);
app.use('/market', marketRouter);
app.use('/contract', contractRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log('Error', err);
  // render the error page
  res.status(err.status || 500);
  res.json({success: false, msg: 'Something failed'});
});

module.exports = app;
