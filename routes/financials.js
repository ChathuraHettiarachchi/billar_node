const express = require('express');
const router = express.Router();

const {Client} = require('pg');

let connectionString;
if (process.env.NODE_ENV === 'development') {
    connectionString = {
        connectionString: 'billar_database'
    }
} else {
    connectionString = {
        connectionString: 'postgres://ltsatbalndpndl:d5c29d1caaa4fbc12bc0c25fe394f38d90307f515213866c6fd8737bcc919f99@ec2-54-221-238-248.compute-1.amazonaws.com:5432/d1b46s3bt2jl9t',
        ssl: true,
    }
}

/* GET finance listing. */
router.get('/', async (req, res, next) => {

    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            const sql = "SELECT * FROM financials ORDER BY financial_id";
            return client.query(sql);
        })
        .then(result => {
            if (result.rows.length === 0) {
                res.status(200).json({
                    status: 1,
                    message: 'No finance found'
                });
            } else {
                res.status(200).json({
                    status: 1,
                    message: 'Available finance listing',
                    content: {
                        financials: result.rows
                    }
                });
            }
        })
        .catch(e => {
            res.status(400).json({
                status: 0,
                message: 'Something went wrong',
                content: {
                    error: e
                }
            });
        })
});

/* GET finance listing. */
router.get('/quotation/:id', async (req, res, next) => {

    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            const sql = "SELECT * FROM financials WHERE quotation_id = $1 ORDER BY financial_id";
            const params =[req.params.id];
            return client.query(sql, params);
        })
        .then(result => {
            if (result.rows.length === 0) {
                res.status(200).json({
                    status: 1,
                    message: 'No finance found'
                });
            } else {
                res.status(200).json({
                    status: 1,
                    message: 'Available finance listing',
                    content: {
                        financials: result.rows
                    }
                });
            }
        })
        .catch(e => {
            res.status(400).json({
                status: 0,
                message: 'Something went wrong',
                content: {
                    error: e
                }
            });
        })
});

module.exports = router;
