const express = require('express');
const router = express.Router();

const {Client} = require('pg');

router.get('/:id', (req, res, next) => {
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
router.get('/', function (req, res, next) {
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
router.post('/new', function (req, res, next) {

    const pStatus = new Client();
    pStatus.connect()
        .then(() => {
            console.log('PG connect with pStatus');
            console.log(req.body);

            const sql = "INSERT INTO project_statuses (title, color) VALUES ($1,$2)";
            const params = [
                req.body.title,
                req.body.color
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
router.delete('/remove/:id', function (req, res, next) {
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
router.post('/update/:id', function (req, res, next) {

    const pStatus = new Client();
    pStatus.connect()
        .then(() => {
            console.log('PG connect with pStatus');
            console.log(req.body);

            const sql = "UPDATE project_statuses SET title = $1, color = $2 WHERE status_id = $3";
            const params = [
                req.body.title,
                req.body.color,
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
