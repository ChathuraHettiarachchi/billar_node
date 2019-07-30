const express = require('express');
const router = express.Router();

const {Client} = require('pg');

/* GET clients listing. */
router.get('/', function (req, res, next) {
    const client = new Client();
    client.connect()
        .then(() => {
            const sql = "SELECT * FROM clients ORDER BY client_id";
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
                        clients: result.rows
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