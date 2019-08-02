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
    const pStatus = new Client();
    pStatus.connect()
        .then(() => {
            const sql = "SELECT * FROM project_statuses WHERE status_id = $1";
            const params = [req.params.id];

            return pStatus.query(sql, params);
        })
        .then(result => {
            if (result.rows.length === 0) {
                res.status(200).json({
                    status: 1,
                    message: 'No pStatus found'
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

/* GET pStatuss listing. */
router.get('/', async (req, res, next) => {
    const pStatus = new Client();
    pStatus.connect()
        .then(() => {
            const sql = "SELECT * FROM project_statuses";
            return pStatus.query(sql);
        })
        .then(result => {
            if (result.rows.length === 0) {
                res.status(200).json({
                    status: 1,
                    message: 'No pStatus found'
                });
            } else {
                res.status(200).json({
                    status: 1,
                    message: 'Available pStatuss',
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

/* POST pStatuss listing. */
router.post('/new', async (req, res, next) => {

    const pStatus = new Client();
    pStatus.connect()
        .then(() => {
            console.log('PG connect with pStatus');
            console.log(req.body);

            const sql = "INSERT INTO project_statuses (title, color) VALUES ($1,$2)";
            const params = [
                req.body.status.title,
                req.body.status.color
            ];

            return pStatus.query(sql, params);
        })
        .then(result => {
            res.status(200).json({
                status: 1,
                message: 'New pStatus added successfully'
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

/* DELETE pStatus. */
router.delete('/remove/:id', async (req, res, next) => {
    const pStatus = new Client();
    pStatus.connect()
        .then(() => {
            const sql = "DELETE FROM project_statuses WHERE status_id = $1";
            const params = [req.params.id];

            return pStatus.query(sql, params);
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

/* UPDATE pStatus. */
router.post('/update/:id', async (req, res, next) => {

    const pStatus = new Client();
    pStatus.connect()
        .then(() => {
            console.log('PG connect with pStatus');
            console.log(req.body);

            const sql = "UPDATE project_statuses SET title = $1, color = $2 WHERE status_id = $3";
            const params = [
                req.body.status.title,
                req.body.status.color,
                req.params.id
            ];

            return pStatus.query(sql, params);
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
