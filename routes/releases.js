const express = require('express');
const router = express.Router();

const {Client} = require('pg');

/* GET releases listing. */
router.get('/', (req, res, next) => {
    const client = new Client();
    client.connect()
        .then(() => {
            const sql = "SELECT * FROM release_plans ORDER BY release_id";
            return client.query(sql);
        })
        .then(result => {
            if (result.rows.length === 0) {
                res.status(200).json({
                    status: 1,
                    message: 'No release found'
                });
            } else {
                res.status(200).json({
                    status: 1,
                    message: 'Available releases',
                    content: {
                        releases: result.rows
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

/* GET releases listing. */
router.get('/all', (req, res, next) => {
    const client = new Client();
    client.connect()
        .then(() => {
            const sql = "SELECT r.release_id, r.description, r.quotation_id, r.release_date, q.created_at AS quotation_created_at, q.title AS quotation_title, cs.name AS client_name, cs.code AS client_code FROM release_plans r INNER JOIN quotations q ON r.quotation_id=q.quotation_id INNER JOIN clients cs ON q.client_id=cs.client_id";
            return client.query(sql);
        })
        .then(result => {
            if (result.rows.length === 0) {
                res.status(200).json({
                    status: 1,
                    message: 'No release found'
                });
            } else {
                res.status(200).json({
                    status: 1,
                    message: 'Available releases',
                    content: {
                        releases: result.rows
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

/* GET releases for quotation listing. */
router.get('/quotation/:id', (req, res, next) => {
    const client = new Client();
    client.connect()
        .then(() => {
            const sql = "SELECT * FROM release_plans WHERE quotation_id = $1 ORDER BY release_id";
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then(result => {
            if (result.rows.length === 0) {
                res.status(200).json({
                    status: 1,
                    message: 'No release found'
                });
            } else {
                res.status(200).json({
                    status: 1,
                    message: 'Available releases',
                    content: {
                        releases: result.rows
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

module.exports = router;