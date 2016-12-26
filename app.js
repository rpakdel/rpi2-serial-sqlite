const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const moment = require('moment');

const index = require('./routes/index');
const users = require('./routes/users');

const serial = require('./serial.js');
const db = require('./db.js');

db.initialize();

function shutdown() {
  serial.close();
  db.close();
  process.exit();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

serial.onData(db.store);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


db.getLastTemperatures(10)
  .then(rows => {
    //console.log(rows);
    //rows.forEach(r => console.log(new Date(r.date).toString()));
    //rows.map(r => r.date).map(d => moment(d)).map(m => console.log(m.fromNow()));
  })
  .catch(err => console.log(err));

let startTime = moment().subtract(moment.duration(10, 'minutes')).toDate();
let endTime = new Date();

startTime = null;
endTime = null;

db.getTemperatures(startTime, endTime)
  .then(rows => {
    //console.log(rows);
    //rows.forEach(r => console.log(new Date(r.date).toString()));
    rows.map(r => r.date).map(d => moment(d)).map(m => console.log(m.fromNow()));
  })
  .catch(err => console.log(err));

module.exports = app;
