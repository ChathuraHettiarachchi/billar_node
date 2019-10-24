const express = require('express');
const router = express.Router();
const {pool} = require('./config');

/* GET releases listing. */
router.get('/', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err){
            release();
            console.log(err);
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            const sql = "SELECT * FROM release_plans ORDER BY release_id";
            client.query(sql, (err2, result2) => {
                release();
                if (err2){
                    console.log(err2);
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    if (result2.rows.length === 0) {
                        res.status(200).json({
                            status: 1,
                            message: 'No release found'
                        });
                    } else {
                        res.status(200).json({
                            status: 1,
                            message: 'Available releases',
                            content: {
                                releases: result2.rows
                            }
                        });
                    }
                }
            })
        }
    })
});

/* GET releases listing. */
router.get('/all', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err){
            release();
            console.log(err);
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            const sql = "SELECT r.release_id, r.description, r.quotation_id, r.release_date, q.created_at AS quotation_created_at, q.title AS quotation_title, cs.name AS client_name, cs.code AS client_code, q.title AS quotation_title, q.amount as quotation_amount FROM release_plans r INNER JOIN quotations q ON r.quotation_id=q.quotation_id INNER JOIN clients cs ON q.client_id=cs.client_id ORDER BY r.release_date";
            client.query(sql, (err2, result2) => {
                release();
                if (err2){
                    console.log(err2);
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    if (result2.rows.length === 0) {
                        res.status(200).json({
                            status: 1,
                            message: 'No release found'
                        });
                    } else {
                        res.status(200).json({
                            status: 1,
                            message: 'Available releases',
                            content: {
                                releases: result2.rows
                            }
                        });
                    }
                }
            })
        }
    })
});

/* GET releases for quotation listing. */
router.get('/quotation/:id', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err){
            release();
            console.log(err);
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            const sql = "SELECT * FROM release_plans WHERE quotation_id = $1 ORDER BY release_id";
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
                            message: 'No release found'
                        });
                    } else {
                        res.status(200).json({
                            status: 1,
                            message: 'Available releases',
                            content: {
                                releases: result2.rows
                            }
                        });
                    }
                }
            })
        }
    })
});

module.exports = router;