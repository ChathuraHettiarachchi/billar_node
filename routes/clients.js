const express = require('express');
const router = express.Router();
const {pool} = require('./config');

router.get('/:id', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if(err){
            release();
            console.log(err);
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            const sql = "SELECT * FROM clients WHERE client_id = $1";
            const params = [req.params.id];

            client.query(sql, params, (err2, result2) => {
                if (err2){
                    release();
                    console.log(err2);
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    release();
                    if (result2.rows.length === 0) {
                        res.status(200).json({
                            status: 1,
                            message: 'No client found'
                        });
                    } else {
                        res.status(200).json({
                            status: 1,
                            message: 'Available details',
                            content: {
                                clients: result2.rows[0]
                            }
                        });
                    }
                }
            });
        }
    })
});

/* GET clients listing. */
router.get('/', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if(err){
            release();
            console.log(err);
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            const sql = "SELECT * FROM clients ORDER BY client_id";

            client.query(sql, (err2, result2) => {
                release();
                if (err2){
                    console.log(err2);
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    if (result2.rows.length === 0) {
                        res.status(200).json({
                            status: 1,
                            message: 'No client found'
                        });
                    } else {
                        res.status(200).json({
                            status: 1,
                            message: 'Available clients',
                            content: {
                                clients: result2.rows
                            }
                        });
                    }
                }
            });
        }
    })
});

/* POST clients listing. */
router.post('/new', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err){
            release();
            console.log(err);
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            console.log('PG connect with client');
            console.log(req.body);

            const sql = "INSERT INTO clients (name, code, email, contact_number, address_line_first, address_line_last, country, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)";
            const params = [
                req.body.client.name,
                req.body.client.code,
                req.body.client.email,
                req.body.client.contact_number,
                req.body.client.address_line_first,
                req.body.client.address_line_last,
                req.body.client.country,
                req.body.client.description
            ];

            client.query(sql, params, (err2, result2) => {
                release();
                if(err2){
                    console.log(err2);
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    res.status(200).json({
                        status: 1,
                        message: 'New client added successfully'
                    })
                }
            });
        }
    })
});

/* DELETE client. */
router.delete('/remove/:id', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err){
            console.log(err);
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            const sql = "DELETE FROM clients WHERE client_id = $1";
            const params = [req.params.id];

            client.query(sql, params, (err2, result2) => {
                if(err2){
                    console.log(err2);
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    res.status(200).json({
                        status: 1,
                        message: 'Client deleted successfully'
                    });
                }
            })
        }
    })
});

/* UPDATE client. */
router.post('/update/:id', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err){
            release();
            console.log(err);
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            console.log('PG connect with client');
            console.log(req.body);

            const sql = "UPDATE clients SET name = $1, code = $2, email = $3, contact_number = $4, address_line_first = $5, address_line_last = $6, country = $7, description = $8 WHERE client_id = $9";
            const params = [
                req.body.client.name,
                req.body.client.code,
                req.body.client.email,
                req.body.client.contact_number,
                req.body.client.address_line_first,
                req.body.client.address_line_last,
                req.body.client.country,
                req.body.client.description,
                req.params.id
            ];

            client.query(sql, params, (err2, result2) => {
                release();
                if (err2){
                    console.log(err2);
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: errr}});
                } else {
                    res.status(200).json({
                        status: 1,
                        message: 'Updated successfully'
                    })
                }
            })
        }
    })
});

module.exports = router;
