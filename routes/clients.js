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
    // const client = new Client(connectionString);
    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            const sql = "SELECT * FROM clients WHERE client_id = $1";
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
                        clients: result.rows[0]
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
    // const client = new Client(connectionString);
    const client = new Client(connectionString);
    await client.connect()
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

/* POST clients listing. */
router.post('/new', async (req, res, next) => {

    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
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
router.delete('/remove/:id', async (req, res, next) =>{

    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            const sql = "DELETE FROM clients WHERE client_id = $1";
            const params = [req.params.id];

            return client.query(sql, params);
        })
        .then(result => {
            res.status(200).json({
                status: 1,
                message: 'Client deleted successfully'
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
