require('dotenv').config({path: __dirname + '/.env'});

const { Pool } = require('pg');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const clientsRouter = require('./routes/clients');
const statusRouter = require('./routes/project_status');
const quotationRouter = require('./routes/quotations');
const paymentRouter = require('./routes/payments');
const financeRouter = require('./routes/financials');
const releaseRouter = require('./routes/releases');

const app = express();

let connectionString = {
    user: 'choots',
    database: process.env.PGDATABASE,
    host: process.env.PGHOST
};

if (process.env.NODE_ENV === 'development') {
    connectionString.database = 'billar_database';
} else {
    connectionString = {
        connectionString: process.env.DATABASE_URL,
        ssl: true
    };
}

const pool = new Pool(connectionString);
pool.on('connect', () => console.log('connected to db'));

app.use(cors());
app.listen(8080, () => {
    console.log("BillarNode is listening on port 4000 and 8080")
});

app.disable('etag');

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
app.use('/payments', paymentRouter);
app.use('/financials', financeRouter);
app.use('/releases', releaseRouter);

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
