const express = require('express');
const router = express.Router();
const {pool} = require('./config');

/* GET payments listing. */
router.get('/', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err){
            release();
            console.log(err);
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            const sql = "SELECT * FROM payment_plans ORDER BY payment_id";
            client.query(sql, (err2, result2) => {
                release();
                if(err2){
                    console.log(err2);
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    if (result2.rows.length === 0) {
                        res.status(200).json({
                            status: 1,
                            message: 'No payments found'
                        });
                    } else {
                        res.status(200).json({
                            status: 1,
                            message: 'Available payments listing',
                            content: {
                                payments: result2.rows
                            }
                        });
                    }
                }
            })
        }
    })
});

/* GET payments for quotation listing. */
router.get('/quotation/:id', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if(err){
            release();
            console.log(err);
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            const sql = "SELECT * FROM payment_plans WHERE quotation_id = $1 ORDER BY payment_id";
            const params = [req.params.id];
            client.query(sql, params, (err2, result2) => {
                release();
                if (err2){
                    console.log(err2);
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    if (result2.rows.length === 0) {
                        res.status(200).json({
                            status: 1,
                            message: 'No payments found'
                        });
                    } else {
                        res.status(200).json({
                            status: 1,
                            message: 'Available payments listing',
                            content: {
                                payments: result2.rows
                            }
                        });
                    }
                }
            })
        }
    })
});

/* GET quotations*/
router.get('/all', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err){
            release();
            console.log(err);
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            const sql = "SELECT p.payment_id, p.invoice_date, p.amount, p.sent_to_client, q.quotation_id, q.created_at AS quotation_created_at,q.title AS quotation_title, cs.name AS client_name, cs.code as client_code FROM payment_plans p INNER JOIN quotations q ON q.quotation_id=p.quotation_id INNER JOIN clients cs ON cs.client_id=q.client_id";
            client.query(sql, (err2, result2) => {
                release();
                if (err2){
                    console.log(err2);
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    if (result2.rows.length === 0) {
                        res.status(200).json({
                            status: 1,
                            message: 'No payments found'
                        });
                    } else {
                        res.status(200).json({
                            status: 1,
                            message: 'Available payments',
                            content: {
                                payments: result2.rows
                            }
                        });
                    }
                }
            })
        }
    })
});


module.exports = router;
