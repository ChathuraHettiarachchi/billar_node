const express = require('express');
const router = express.Router();

const {Client} = require('pg');

/* GET finance listing. */
router.get('/', (req, res, next) => {

    const client = new Client();
    client.connect()
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
router.get('/quotation/:id', (req, res, next) => {

    const client = new Client();
    client.connect()
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
