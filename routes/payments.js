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

/* GET payments listing. */
router.get('/', async (req, res, next) => {

    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            const sql = "SELECT * FROM payment_plans ORDER BY payment_id";

            return client.query(sql);
        })
        .then(result => {
            client.end();
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
            client.end();
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
router.get('/quotation/:id', async (req, res, next) => {

    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            const sql = "SELECT * FROM payment_plans WHERE quotation_id = $1 ORDER BY payment_id";
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then(result => {
            client.end();
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
            client.end();
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
router.get('/all', async (req, res, next) => {
    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            const sql = "SELECT p.payment_id, p.invoice_date, p.amount, p.sent_to_client, q.quotation_id, q.created_at AS quotation_created_at,q.title AS quotation_title, cs.name AS client_name, cs.code as client_code FROM payment_plans p INNER JOIN quotations q ON q.quotation_id=p.quotation_id INNER JOIN clients cs ON cs.client_id=q.client_id";
            return client.query(sql);
        })
        .then(result => {
            client.end();
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
            client.end();
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
