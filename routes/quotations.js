const express = require('express');
const router = express.Router();
const dateFormat = require('dateformat');
const { pool } = require('./config');
const format = require('pg-format');

/* GET quotation*/
router.get('/:id', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        const sql = "SELECT quotations.quotation_id, quotations.title, quotations.description, quotations.amount, quotations.terms, quotations.created_at, quotations.updated_at, quotations.status, quotations.quotation_number,clients.code, clients.client_id, clients.email, clients.address_line_first, clients.address_line_last, clients.contact_number, clients.name " +
            "FROM quotations INNER JOIN clients ON quotations.client_id=clients.client_id " +
            "WHERE quotations.quotation_id = $1";
        const params = [req.params.id];
        client.query(sql, params, (err, result) => {
            release();
            if (err) {
                console.log(err);
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
            "quotations.terms, quotations.created_at, quotations.updated_at, quotations.status, quotations.quotation_number, clients.code, clients.client_id" +
            " FROM quotations INNER JOIN clients ON quotations.client_id=clients.client_id";

        client.query(sql, (err, result) => {
            release();
            if (err) {
                console.log(err);
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

        const indexSql = "SELECT * FROM quotation_index WHERE year = $1";
        const indexParams = [new Date().getFullYear()];

        client.query(indexSql, indexParams, (errIndex, resultIndex) => {
            if (errIndex) {
                release();
                console.log(errIndex);
                res.status(400).json({ status: 0, message: 'Something went wrong', content: { error: errIndex } });
            } else {

                let iSQL = "";
                let iParams = [];

                if (resultIndex.rows.length === 0) {
                    iSQL = "INSERT INTO quotation_index (year, index) VALUES ($1,$2) RETURNING index";
                    iParams = [
                        new Date().getFullYear(),
                        0
                    ]
                } else {
                    indexValue = resultIndex.rows[0].index;
                    iSQL = "UPDATE quotation_index SET index = $1 WHERE year = $2 RETURNING index";
                    iParams = [
                        (parseInt(indexValue) + 1),
                        new Date().getFullYear()
                    ]
                }

                client.query(iSQL, iParams, (errI, resultI) => {
                    if (errI) {
                        release();
                        console.log(errI);
                        res.status(400).json({ status: 0, message: 'Something went wrong', content: { error: errI } });
                    } else {
                        let quotNumber = (""+new Date().getFullYear()+""+(1000+parseInt(resultI.rows[0].index)));
                        const sql = "INSERT INTO quotations (created_at, updated_at, title, description, amount, terms, client_id, quotation_number) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING quotation_id";
                        const params = [
                            dateFormat(now, "isoDateTime"),
                            dateFormat(now, "isoDateTime"),
                            req.body.quotation.title,
                            req.body.quotation.description,
                            req.body.quotation.amount,
                            req.body.quotation.terms,
                            req.body.quotation.client_id,
                            quotNumber
                        ];

                        client.query(sql, params, (err, result) => {
                            if (err) {
                                release();
                                console.log(err);
                                res.status(400).json({ status: 0, message: 'Something went wrong', content: { error: err } });
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

                                let sql = "";
                                if (array.length === 0) {
                                    sql = "--NODATA";
                                } else {
                                    sql = format('INSERT INTO financials (description, amount, quotation_id) VALUES %L RETURNING quotation_id', array);
                                }

                                client.query(sql, (err2, result2) => {
                                    if (err2) {
                                        release();
                                        console.log(err2);
                                        res.status(400).json({ status: 0, message: 'Something went wrong', content: { error: err2 } });
                                    } else {
                                        console.log('PG connect with releases');

                                        let rel = req.body.quotation.releases;
                                        let i;
                                        let array = [];
                                        for (i = 0; i < rel.length; i++) {
                                            const params = [rel[i].description, rel[i].release_date, result2.rows[0].quotation_id];
                                            array.push(params);
                                        }

                                        let sql = "";
                                        if (array.length === 0) {
                                            sql = "--NODATA";
                                        } else {
                                            sql = format('INSERT INTO release_plans (description, release_date, quotation_id) VALUES %L RETURNING quotation_id', array);
                                        }

                                        client.query(sql, (err3, result3) => {
                                            if (err3) {
                                                console.log(err3);
                                                release();
                                                res.status(400).json({
                                                    status: 0,
                                                    message: 'Something went wrong',
                                                    content: { error: err3 }
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

                                                let sql = "";
                                                if (array.length === 0) {
                                                    sql = "--NODATA";
                                                } else {
                                                    sql = format('INSERT INTO payment_plans (description, amount, invoice_date, quotation_id) VALUES %L RETURNING quotation_id', array);
                                                }

                                                client.query(sql, (err4, result4) => {
                                                    release();
                                                    if (err4) {
                                                        console.log(err4);
                                                        res.status(400).json({
                                                            status: 0,
                                                            message: 'Something went wrong',
                                                            content: { error: err4 }
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
                    }
                });
            }
        });
    })
});

/* DELETE quotation*/
router.delete('/remove/:id', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err) {
            release();
            console.log(err);
            res.status(400).json({ status: 0, message: 'Something went wrong', content: { error: err } });
        } else {
            const sql = "DELETE FROM financials WHERE quotation_id = $1";
            const params = [req.params.id];

            client.query(sql, params, (err2, result2) => {
                if (err2) {
                    release();
                    console.log(err2);
                    res.status(400).json({ status: 0, message: 'Something went wrong', content: { error: err2 } });
                } else {
                    const sql = "DELETE FROM release_plans WHERE quotation_id = $1";
                    const params = [req.params.id];

                    client.query(sql, params, (err3, result3) => {
                        if (err3) {
                            release();
                            console.log(err3);
                            res.status(400).json({ status: 0, message: 'Something went wrong', content: { error: err3 } });
                        } else {
                            const sql = "DELETE FROM payment_plans WHERE quotation_id = $1";
                            const params = [req.params.id];

                            client.query(sql, params, (err4, result4) => {
                                if (err4) {
                                    release();
                                    console.log(err4);
                                    res.status(400).json({
                                        status: 0,
                                        message: 'Something went wrong',
                                        content: { error: err4 }
                                    });
                                } else {
                                    const sql = "DELETE FROM quotations WHERE quotation_id = $1";
                                    const params = [req.params.id];

                                    client.query(sql, params, (err5, result5) => {
                                        release();
                                        if (err5) {
                                            console.log(err5);
                                            res.status(400).json({
                                                status: 0,
                                                message: 'Something went wrong',
                                                content: { error: err5 }
                                            });
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

router.post('/update/:id', async (req, res, next) => {
    let now = new Date();
    console.log(req.body);

    await pool.connect((err, client, release) => {
        if (err) {
            release();
            console.log(err);
            res.status(400).json({ status: 0, message: 'Something went wrong', content: { error: err } });
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
                if (err2) {
                    release();
                    console.log(err2);
                    res.status(400).json({ status: 0, message: 'Something went wrong', content: { error: err2 } });
                } else {
                    console.log('PG connect with finance');

                    let fin = req.body.quotation.financials;
                    let financialQuery = "";
                    for (i = 0; i < fin.length; i++) {
                        if (fin[i].id === -1) {
                            financialQuery += "INSERT INTO financials (description, amount, quotation_id) VALUES ('" + fin[i].description + "', " + fin[i].amount + ", " + req.params.id + ")"
                        } else {
                            financialQuery += "UPDATE financials SET description='" + fin[i].description + "', amount=" + fin[i].amount + " WHERE financial_id=" + fin[i].id + "";
                        }
                        financialQuery += ";"
                    }

                    if (fin.length === 0) {
                        financialQuery = "--NODATA";
                    }

                    client.query(financialQuery, (err3, result3) => {
                        if (err3) {
                            release();
                            console.log(err3);
                            res.status(400).json({ status: 0, message: 'Something went wrong', content: { error: err3 } });
                        } else {
                            console.log('PG created and updated records on finance');
                            console.log('PG connect with release plans');

                            let rel = req.body.quotation.releases;
                            let releasesQuery = "";
                            for (i = 0; i < rel.length; i++) {
                                if (rel[i].id === -1) {
                                    releasesQuery += "INSERT INTO release_plans (description, release_date, quotation_id) VALUES ('" + rel[i].description + "', '" + rel[i].release_date + "', " + req.params.id + ")"
                                } else {
                                    releasesQuery += "UPDATE release_plans SET description='" + rel[i].description + "', release_date='" + rel[i].release_date + "' WHERE release_id=" + rel[i].id + "";
                                }
                                releasesQuery += ";"
                            }

                            if (rel.length === 0) {
                                releasesQuery = "--NODATA";
                            }

                            client.query(releasesQuery, (err4, result4) => {
                                if (err4) {
                                    release();
                                    console.log(err4);
                                    res.status(400).json({
                                        status: 0,
                                        message: 'Something went wrong',
                                        content: { error: err4 }
                                    });
                                } else {
                                    console.log('PG created and updated records on release plan');
                                    console.log('PG connect with payments');

                                    let pay = req.body.quotation.payments;
                                    let paymentQuery = "";
                                    for (i = 0; i < pay.length; i++) {
                                        if (pay[i].id === -1) {
                                            paymentQuery += "INSERT INTO payment_plans (description, amount, invoice_date, quotation_id) VALUES ('" + pay[i].description + "', " + pay[i].amount + ", '" + pay[i].invoice_date + "', " + req.params.id + ")"
                                        } else {
                                            paymentQuery += "UPDATE payment_plans SET description='" + pay[i].description + "', amount=" + pay[i].amount + ", invoice_date='" + pay[i].invoice_date + "' WHERE payment_id=" + pay[i].id + "";
                                        }
                                        paymentQuery += ";"
                                    }

                                    if (rel.length === 0) {
                                        paymentQuery = "--NODATA";
                                    }

                                    client.query(paymentQuery, (err5, result5) => {
                                        if (err5) {
                                            release();
                                            console.log(err5);
                                            res.status(400).json({
                                                status: 0,
                                                message: 'Something went wrong',
                                                content: { error: err5 }
                                            });
                                        } else {
                                            console.log('PG created and updated records on release plan');
                                            console.log('PG deleting items');

                                            let deletedItems = req.body.quotation.deletedItems;
                                            let deleteQuery = "";

                                            let rels = deletedItems.releases;
                                            for (i = 0; i < rels.length; i++) {
                                                deleteQuery += ("DELETE FROM release_plans WHERE release_id=" + rels[i] + ";")
                                            }

                                            let fins = deletedItems.financials;
                                            for (i = 0; i < fins.length; i++) {
                                                deleteQuery += ("DELETE FROM financials WHERE financial_id=" + fins[i] + ";")
                                            }

                                            let pays = deletedItems.payments;
                                            for (i = 0; i < pays.length; i++) {
                                                deleteQuery += ("DELETE FROM payment_plans WHERE payment_id=" + pays[i] + ";")
                                            }

                                            client.query(deleteQuery, (err6, result6) => {
                                                if (err6) {
                                                    release();
                                                    console.log(err6);
                                                    res.status(400).json({
                                                        status: 0,
                                                        message: 'Something went wrong',
                                                        content: { error: err6 }
                                                    });
                                                } else {
                                                    release();
                                                    res.status(200).json({
                                                        status: 1,
                                                        message: 'Quotations updated successfully'
                                                    })
                                                }
                                            });
                                        }
                                    })
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
        if (err) {
            release();
            console.log(err);
            res.status(400).json({ status: 0, message: 'Something went wrong', content: { error: err } });
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
                if (err2) {
                    console.log(err2);
                    res.status(400).json({ status: 0, message: 'Something went wrong', content: { error: err2 } });
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
