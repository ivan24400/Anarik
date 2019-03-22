var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');

//Routes
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var storeRouter = require('./routes/store');
var adminRouter = require('./routes/admin');
var marketRouter = require('./routes/market');
var contractRouter = require('./routes/contract');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use(cookieParser());
var MemoryStore = session.MemoryStore;
app.use(session({
    name:'shession',
    secret: 'grasshopper',
    resave: true,
    saveUninitialized: true,
    store : new MemoryStore(),
    cookie : {maxAge: 2*60*60*1000, httpOnly: true, secure: false}
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.json({success: false, msg:'Something failed'});
});

module.exports = app;
