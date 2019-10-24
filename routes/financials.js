const express = require('express');
const router = express.Router();
const {pool} = require('./config');

/* GET finance listing. */
router.get('/', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err){
            release();
            console.log(err);
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            const sql = "SELECT * FROM financials ORDER BY financial_id";
            client.query(sql, (err2, result2) => {
                release();
                if(err2){
                    release();
                    console.log(err2);
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    if (result2.rows.length === 0) {
                        res.status(200).json({
                            status: 1,
                            message: 'No finance found'
                        });
                    } else {
                        res.status(200).json({
                            status: 1,
                            message: 'Available finance listing',
                            content: {
                                financials: result2.rows
                            }
                        });
                    }
                }
            })
        }
    })
});

/* GET finance listing. */
router.get('/quotation/:id', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err){
            release();
            console.log(err);
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            const sql = "SELECT * FROM financials WHERE quotation_id = $1 ORDER BY financial_id";
            const params =[req.params.id];
            client.query(sql, params, (err2, result2) => {
                release();
                if (err2){
                    console.log(err2);
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    if (result2.rows.length === 0) {
                        res.status(200).json({
                            status: 1,
                            message: 'No finance found'
                        });
                    } else {
                        res.status(200).json({
                            status: 1,
                            message: 'Available finance listing',
                            content: {
                                financials: result2.rows
                            }
                        });
                    }
                }
            })
        }
    })
});

module.exports = router;
