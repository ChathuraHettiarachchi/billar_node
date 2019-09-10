const express = require('express');
const router = express.Router();
const dateFormat = require('dateformat');
const {pool} = require('./config');
const format = require('pg-format');

/* GET quotation*/
router.get('/:id', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        const sql = "SELECT quotations.quotation_id, quotations.title, quotations.description, quotations.amount, quotations.terms, quotations.created_at, quotations.updated_at, quotations.status,clients.code, clients.client_id, clients.email, clients.address_line_first, clients.address_line_last, clients.contact_number, clients.name " +
            "FROM quotations INNER JOIN clients ON quotations.client_id=clients.client_id " +
            "WHERE quotations.quotation_id = $1";
        const params = [req.params.id];
        client.query(sql, params, (err, result) => {
            release();
            if (err) {
                res.status(400).json({
                    status: 0,
                    message: 'Something went wrong',
                    content: {
                        error: e
                    }
                });
            } else {
                if (result.rows.length === 0) {
                    res.status(200).json({
                        status: 1,
                        message: 'No client found'
                    });
                } else {
                    res.status(200).json({
                        status: 1,
                        message: 'Available details',
                        content: {
                            quotations: result.rows[0]
                        }
                    });
                }
            }
        })
    })
});

/* GET quotations*/
router.get('/', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        const sql = "SELECT quotations.quotation_id, quotations.title, quotations.description, quotations.amount, " +
            "quotations.terms, quotations.created_at, quotations.updated_at, quotations.status, clients.code, clients.client_id" +
            " FROM quotations INNER JOIN clients ON quotations.client_id=clients.client_id";

        client.query(sql, (err, result) => {
            release();
            if (err) {
                res.status(400).json({
                    status: 0,
                    message: 'Something went wrong',
                    content: {
                        error: e
                    }
                });
            } else {
                if (result.rows.length === 0) {
                    res.status(200).json({
                        status: 1,
                        message: 'No quotations found'
                    });
                } else {
                    res.status(200).json({
                        status: 1,
                        message: 'Available quotations',
                        content: {
                            quotations: result.rows
                        }
                    });
                }
            }
        })
    })
});

/* POST quotation*/
router.post('/new', async (req, res, next) => {
    let now = new Date();
    await pool.connect((err, client, release) => {
        console.log('PG connect with quotation');
        console.log(req.body);

        const sql = "INSERT INTO quotations (created_at, updated_at, title, description, amount, terms, client_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING quotation_id";
        const params = [
            dateFormat(now, "isoDateTime"),
            dateFormat(now, "isoDateTime"),
            req.body.quotation.title,
            req.body.quotation.description,
            req.body.quotation.amount,
            req.body.quotation.terms,
            req.body.quotation.client_id
        ];

        client.query(sql, params, (err, result) => {
            if (err) {
                release();
                res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
            } else {
                console.log('PG connect with finance');
                const quot_id = result.rows[0].quotation_id;

                let fin = req.body.quotation.financials;
                let i;

                let array = [];
                for (i = 0; i < fin.length; i++) {
                    const params = [fin[i].description, fin[i].amount, quot_id];
                    array.push(params);
                }

                const sql = format('INSERT INTO financials (description, amount, quotation_id) VALUES %L RETURNING quotation_id', array);
                client.query(sql, (err2, result2) => {
                    if (err2) {
                        release();
                        res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                    } else {
                        console.log('PG connect with releases');

                        let rel = req.body.quotation.releases;
                        let i;
                        let array = [];
                        for (i = 0; i < rel.length; i++) {
                            const params = [rel[i].description, rel[i].release_date, result2.rows[0].quotation_id];
                            array.push(params);
                        }

                        const sql = format('INSERT INTO release_plans (description, release_date, quotation_id) VALUES %L RETURNING quotation_id', array);
                        client.query(sql, (err3, result3) => {
                            if (err3) {
                                release();
                                res.status(400).json({
                                    status: 0,
                                    message: 'Something went wrong',
                                    content: {error: err3}
                                });
                            } else {
                                console.log('PG connect with payment');

                                let pay = req.body.quotation.payments;
                                let i;
                                let array = [];
                                for (i = 0; i < pay.length; i++) {
                                    const params = [pay[i].description, pay[i].amount, pay[i].invoice_date, result.rows[0].quotation_id];
                                    array.push(params);
                                }

                                const sql = format('INSERT INTO payment_plans (description, amount, invoice_date, quotation_id) VALUES %L RETURNING quotation_id', array);
                                client.query(sql, (err4, result4) => {
                                    release();
                                    if (err4) {
                                        res.status(400).json({
                                            status: 0,
                                            message: 'Something went wrong',
                                            content: {error: err4}
                                        });
                                    } else {
                                        res.status(200).json({
                                            status: 1,
                                            message: 'New quotation added successfully'
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })

    })
});

/* DELETE quotation*/
router.delete('/remove/:id', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err){
            release();
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            const sql = "DELETE FROM financials WHERE quotation_id = $1";
            const params = [req.params.id];

            client.query(sql, params, (err2, result2) => {
                if (err2){
                    release();
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    const sql = "DELETE FROM release_plans WHERE quotation_id = $1";
                    const params = [req.params.id];

                    client.query(sql, params, (err3, result3) => {
                        if (err3){
                            release();
                            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err3}});
                        } else {
                            const sql = "DELETE FROM payment_plans WHERE quotation_id = $1";
                            const params = [req.params.id];

                            client.query(sql, params, (err4, result4) => {
                                if (err4){
                                    release();
                                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err4}});
                                } else {
                                    const sql = "DELETE FROM quotations WHERE quotation_id = $1";
                                    const params = [req.params.id];

                                    client.query(sql, params, (err5, result5) => {
                                        release();
                                        if(err5){
                                            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err5}});
                                        } else {
                                            res.status(200).json({
                                                status: 1,
                                                message: 'Quotation deleted successfully'
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            })
        }
    })
});

// /* UPDATE quotation*/
router.post('/update/:id', async (req, res, next) => {
    let now = new Date();
    console.log(req.body);

    await pool.connect((err, client, release) => {
        if (err){
            release();
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            console.log('PG connect with quotation');
            console.log(req.body);

            const sql = "UPDATE quotations SET updated_at = $1, title = $2, description = $3, amount = $4, terms = $5 WHERE quotation_id = $6";
            const params = [
                dateFormat(now, "isoDateTime"),
                req.body.quotation.title,
                req.body.quotation.description,
                req.body.quotation.amount,
                req.body.quotation.terms,
                req.params.id
            ];

            client.query(sql, params, (err2, result2) => {
                if (err2){
                    release();
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    const sql = "DELETE FROM financials WHERE quotation_id = $1";
                    client.query(sql, [req.params.id], (err3, result3) => {
                        if (err3){
                            release();
                            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err3}});
                        } else {
                            console.log('PG connect with finance');

                            const quot_id = req.params.id;

                            let fin = req.body.quotation.financials;
                            let i;
                            let array = [];
                            for (i = 0; i < fin.length; i++) {
                                const params = [fin[i].description, fin[i].amount, quot_id];
                                array.push(params)
                            }

                            const sql = format('INSERT INTO financials (description, amount, quotation_id) VALUES %L RETURNING quotation_id', array);
                            client.query(sql, (err4, result4) => {
                                if (err4){
                                    release();
                                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err4}});
                                } else {
                                    const sql = "DELETE FROM release_plans WHERE quotation_id = $1";
                                    client.query(sql, [req.params.id], (err5, result5) => {
                                        if(err5){
                                            release();
                                            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err5}});
                                        } else {
                                            console.log('PG connect with releases');

                                            let rel = req.body.quotation.releases;
                                            let i;
                                            let array = [];
                                            for (i = 0; i < rel.length; i++) {
                                                const params = [rel[i].description, rel[i].release_date, req.params.id];
                                                array.push(params);
                                            }

                                            const sql = format('INSERT INTO release_plans (description, release_date, quotation_id) VALUES %L RETURNING quotation_id', array);
                                            client.query(sql, (err6, result6) => {
                                                if (err6){
                                                    release();
                                                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err6}});
                                                } else {
                                                    const sql = "DELETE FROM payment_plans WHERE quotation_id = $1";
                                                    client.query(sql, [req.params.id], (err7, result7) => {
                                                        if (err7){
                                                            release();
                                                            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err7}});
                                                        } else {
                                                            console.log('PG connect with payment');

                                                            let pay = req.body.quotation.payments;
                                                            let i;
                                                            let array = [];
                                                            for (i = 0; i < pay.length; i++) {
                                                                const params = [pay[i].description, pay[i].amount, pay[i].invoice_date, req.params.id];
                                                                array.push(params)
                                                            }

                                                            const sql = format('INSERT INTO payment_plans (description, amount, invoice_date, quotation_id) VALUES %L RETURNING quotation_id', array);
                                                            client.query(sql, (err8, result8) => {
                                                                release();
                                                                if (err8){
                                                                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err8}});
                                                                } else {
                                                                    res.status(200).json({status: 1, message: 'Quotations updated successfully'})
                                                                }
                                                            })
                                                        }
                                                    });
                                                }
                                            })
                                        }
                                    });
                                }
                            })
                        }
                    })
                }
            });
        }
    })
});

/* UPDATE status*/
router.post('/update/:id/status', async (req, res, next) => {

    let now = new Date();
    await pool.connect((err, client, release) => {
        if (err){
            release();
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            console.log('PG connect with quotation');
            console.log(req.body);
            console.log(req.body.quotation.status);

            const sql = "UPDATE quotations SET updated_at = $1, status = $2 WHERE quotation_id = $3";
            const params = [
                dateFormat(now, "isoDateTime"),
                req.body.quotation.status,
                req.params.id
            ];

            client.query(sql, params, (err2, result2) => {
                release();
                if(err2){
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    res.status(200).json({
                        status: 1,
                        message: 'Quotation updated'
                    });
                }
            })
        }
    })
});

module.exports = router;
