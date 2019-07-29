require('dotenv').config({path: __dirname + '/.env'});

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const clientsRouter = require('./routes/clients');
const statusRouter = require('./routes/project_status');
const quotationRouter = require('./routes/quotations');
// const paymentRouter = require('./routes/payment_plans');
// const financeRouter = require('./routes/financials');
// const releaseRouter = require('./routes/release_plans');

const app = express();

app.listen(4000, () => {
    console.log("BillarNode is listening on port 4000")
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/clients', clientsRouter);
app.use('/status', statusRouter);
app.use('/quotations', quotationRouter);
// app.use('/payments', paymentRouter);
// app.use('/finances', financeRouter);
// app.use('/releases', releaseRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
