const express = require('express');
const router = express.Router();

const {Client} = require('pg');

/* GET payments listing. */
router.get('/', (req, res, next) => {

    const client = new Client();
    client.connect()
        .then(() => {
            const sql = "SELECT * FROM payment_plans ORDER BY payment_id";

            return client.query(sql);
        })
        .then(result => {
            if (result.rows.length === 0) {
                res.status(200).json({
                    status: 1,
                    message: 'No payments found'
                });
            } else {
                res.status(200).json({
                    status: 1,
                    message: 'Available payments listing',
                    content: {
                        payments: result.rows
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

/* GET payments for quotation listing. */
router.get('/quotation/:id', (req, res, next) => {

    const client = new Client();
    client.connect()
        .then(() => {
            const sql = "SELECT * FROM payment_plans WHERE quotation_id = $1 ORDER BY payment_id";
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then(result => {
            if (result.rows.length === 0) {
                res.status(200).json({
                    status: 1,
                    message: 'No payments found'
                });
            } else {
                res.status(200).json({
                    status: 1,
                    message: 'Available payments listing',
                    content: {
                        payments: result.rows
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

/* GET quotations*/
router.get('/all', function (req, res, next) {
    const client = new Client();
    client.connect()
        .then(() => {
            const sql = "SELECT p.payment_id, p.invoice_date, p.amount, p.sent_to_client, q.quotation_id, q.created_at AS quotation_created_at,q.title AS quotation_title, cs.name AS client_name, cs.code as client_code FROM payment_plans p INNER JOIN quotations q ON q.quotation_id=p.quotation_id INNER JOIN clients cs ON cs.client_id=q.client_id";
            return client.query(sql);
        })
        .then(result => {
            if (result.rows.length === 0) {
                res.status(200).json({
                    status: 1,
                    message: 'No payments found'
                });
            } else {
                res.status(200).json({
                    status: 1,
                    message: 'Available payments',
                    content: {
                        payments: result.rows
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
