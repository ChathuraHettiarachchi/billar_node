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

router.get('/:id', async (req, res, next) => {

    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            const sql = "SELECT * FROM project_statuses WHERE status_id = $1";
            const params = [req.params.id];

            return client.query(sql, params);
        })
        .then(result => {
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
                        status: result.rows[0]
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

/* GET clients listing. */
router.get('/', async (req, res, next) => {

    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            const sql = "SELECT * FROM project_statuses";
            return client.query(sql);
        })
        .then(result => {
            if (result.rows.length === 0) {
                res.status(200).json({
                    status: 1,
                    message: 'No client found'
                });
            } else {
                res.status(200).json({
                    status: 1,
                    message: 'Available clients',
                    content: {
                        status_list: result.rows
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

/* POST clients listing. */
router.post('/new', async (req, res, next) => {

    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            console.log('PG connect with client');
            console.log(req.body);

            const sql = "INSERT INTO project_statuses (title, color) VALUES ($1,$2)";
            const params = [
                req.body.status.title,
                req.body.status.color
            ];

            return client.query(sql, params);
        })
        .then(result => {
            res.status(200).json({
                status: 1,
                message: 'New client added successfully'
            })
        })
        .catch(e => {
            res.status(400).json({
                status: 0,
                message: 'Something went wrong',
                content: {
                    error: e
                }
            });
        });
});

/* DELETE client. */
router.delete('/remove/:id', async (req, res, next) => {

    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            const sql = "DELETE FROM project_statuses WHERE status_id = $1";
            const params = [req.params.id];

            return client.query(sql, params);
        })
        .then(result => {
            res.status(200).json({
                status: 1,
                message: 'Status deleted successfully'
            });
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

/* UPDATE client. */
router.post('/update/:id', async (req, res, next) => {

    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            console.log('PG connect with client');
            console.log(req.body);

            const sql = "UPDATE project_statuses SET title = $1, color = $2 WHERE status_id = $3";
            const params = [
                req.body.status.title,
                req.body.status.color,
                req.params.id
            ];

            return client.query(sql, params);
        })
        .then(result => {
            res.status(200).json({
                status: 1,
                message: 'Updated successfully'
            })
        })
        .catch(e => {
            res.status(400).json({
                status: 0,
                message: 'Something went wrong',
                content: {
                    error: e
                }
            });
        });
});

module.exports = router;
