const express = require('express');
const router = express.Router();
const { pool } = require('./config');

router.get('/:id', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err){
            release();
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            const sql = "SELECT * FROM project_statuses WHERE status_id = $1";
            const params = [req.params.id];

            client.query(sql, params, (err2, result2) => {
                release();
                if (err2){
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
                            message: 'Available details',
                            content: {
                                status: result2.rows[0]
                            }
                        });
                    }
                }
            })
        }
    })
});

/* GET clients listing. */
router.get('/', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err){
            release();
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            const sql = "SELECT * FROM project_statuses";
            client.query(sql, (err2, result2) => {
                release();
                if (err2){
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
                                status_list: result2.rows
                            }
                        });
                    }
                }
            })
        }
    })
});

/* POST clients listing. */
router.post('/new', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err){
            release();
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            console.log('PG connect with client');
            console.log(req.body);

            const sql = "INSERT INTO project_statuses (title, color) VALUES ($1,$2)";
            const params = [
                req.body.status.title,
                req.body.status.color
            ];

            client.query(sql, params, (err2, result2) => {
                release();
                if (err2){
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    res.status(200).json({
                        status: 1,
                        message: 'New client added successfully'
                    })
                }
            })
        }
    })
});

/* DELETE client. */
router.delete('/remove/:id', async (req, res, next) => {
    await pool.connect((err, client, release) => {
        if (err){
            release();
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            const sql = "DELETE FROM project_statuses WHERE status_id = $1";
            const params = [req.params.id];

            client.query(sql, params, (err2, result2) => {
                release();
                if(err2){
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
                } else {
                    res.status(200).json({
                        status: 1,
                        message: 'Status deleted successfully'
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
            res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err}});
        } else {
            console.log('PG connect with client');
            console.log(req.body);

            const sql = "UPDATE project_statuses SET title = $1, color = $2 WHERE status_id = $3";
            const params = [
                req.body.status.title,
                req.body.status.color,
                req.params.id
            ];

            client.query(sql, params, (err2, result2) => {
                release();
                if (err2){
                    res.status(400).json({status: 0, message: 'Something went wrong', content: {error: err2}});
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
