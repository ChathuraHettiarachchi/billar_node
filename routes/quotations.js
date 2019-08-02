const express = require('express');
const router = express.Router();
const dateFormat = require('dateformat');

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

/* GET quotation*/
router.get('/:id', async (req, res, next) => {
    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            const sql = "SELECT quotations.quotation_id, quotations.title, quotations.description, quotations.amount, quotations.terms, quotations.created_at, quotations.updated_at, quotations.status,clients.code, clients.client_id, clients.email, clients.address_line_first, clients.address_line_last, clients.contact_number, clients.name " +
                "FROM quotations INNER JOIN clients ON quotations.client_id=clients.client_id " +
                "WHERE quotations.quotation_id = $1";
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
                        quotations: result.rows[0]
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

/* GET quotations*/
router.get('/', async (req, res, next) => {
    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            const sql = "SELECT quotations.quotation_id, quotations.title, quotations.description, quotations.amount, " +
                "quotations.terms, quotations.created_at, quotations.updated_at, quotations.status, clients.code, clients.client_id" +
                " FROM quotations INNER JOIN clients ON quotations.client_id=clients.client_id";
            return client.query(sql);
        })
        .then(result => {
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

/* POST quotation*/
router.post('/new', async (req, res, next) => {

    const client = new Client(connectionString);
    let now = new Date();

    await client.connect()
        .then(() => {
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

            return client.query(sql, params);
        })
        .then(result => {
            console.log('PG connect with finance');

            const sql = "INSERT INTO financials (description, amount, quotation_id) VALUES ($1,$2,$3)";
            const quot_id = result.rows[0].quotation_id;

            let fin = req.body.quotation.financials;
            let i;
            for (i = 0; i < fin.length; i++) {
                const params = [fin[i].description, fin[i].amount, quot_id];
                client.query(sql, params);
            }

            return quot_id;
        })
        .then(result => {
            console.log('PG connect with releases');

            const sql = "INSERT INTO release_plans (description, release_date, quotation_id) VALUES ($1,$2,$3)";

            let rel = req.body.quotation.releases;
            let i;
            for (i = 0; i < rel.length; i++) {
                const params = [rel[i].description, rel[i].release_date, result];
                client.query(sql, params);
            }

            return result;
        })
        .then(result => {
            console.log('PG connect with payment');

            const sql = "INSERT INTO payment_plans (description, amount, invoice_date, quotation_id) VALUES ($1,$2,$3, $4)";

            let pay = req.body.quotation.payments;
            let i;
            for (i = 0; i < pay.length; i++) {
                const params = [pay[i].description, pay[i].amount, pay[i].invoice_date, result];
                client.query(sql, params);
            }

            return result;
        })
        .then(result => {
            res.status(200).json({
                status: 1,
                message: 'New quotation added successfully'
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

/* DELETE quotation*/
router.delete('/remove/:id', async (req, res, next) => {
    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            const sql = "DELETE FROM financials WHERE quotation_id = $1";
            const params = [req.params.id];

            return client.query(sql, params);
        })
        .then(() => {
            const sql = "DELETE FROM release_plans WHERE quotation_id = $1";
            const params = [req.params.id];

            return client.query(sql, params);
        })
        .then(() => {
            const sql = "DELETE FROM payment_plans WHERE quotation_id = $1";
            const params = [req.params.id];

            return client.query(sql, params);
        })
        .then(() => {
            const sql = "DELETE FROM quotations WHERE quotation_id = $1";
            const params = [req.params.id];

            return client.query(sql, params);
        })
        .then(result => {
            res.status(200).json({
                status: 1,
                message: 'Quotation deleted successfully'
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

// /* UPDATE quotation*/
router.post('/update/:id', async (req, res, next) => {

    const client = new Client(connectionString);
    let now = new Date();

    console.log(req.body);

    await client.connect()
        .then(() => {
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

            return client.query(sql, params);
        })
        .then(result => {
            const sql = "DELETE FROM financials WHERE quotation_id = $1";
            return client.query(sql, [req.params.id]);
        })
        .then(result => {
            console.log('PG connect with finance');

            const sql = "INSERT INTO financials (description, amount, quotation_id) VALUES ($1,$2,$3)";
            const quot_id = req.params.id;

            let fin = req.body.quotation.financials;
            let i;
            for (i = 0; i < fin.length; i++) {
                const params = [fin[i].description, fin[i].amount, quot_id];
                client.query(sql, params);
            }

            return quot_id;
        })
        .then(result => {
            const sql = "DELETE FROM release_plans WHERE quotation_id = $1";
            return client.query(sql, [req.params.id]);
        })
        .then(result => {
            console.log('PG connect with releases');

            const sql = "INSERT INTO release_plans (description, release_date, quotation_id) VALUES ($1,$2,$3)";

            let rel = req.body.quotation.releases;
            let i;
            for (i = 0; i < rel.length; i++) {
                const params = [rel[i].description, rel[i].release_date, req.params.id];
                client.query(sql, params);
            }

            return result;
        })
        .then(result => {
            const sql = "DELETE FROM payment_plans WHERE quotation_id = $1";
            return client.query(sql, [req.params.id]);
        })
        .then(result => {
            console.log('PG connect with payment');

            const sql = "INSERT INTO payment_plans (description, amount, invoice_date, quotation_id) VALUES ($1,$2,$3, $4)";

            let pay = req.body.quotation.payments;
            let i;
            for (i = 0; i < pay.length; i++) {
                const params = [pay[i].description, pay[i].amount, pay[i].invoice_date, req.params.id];
                client.query(sql, params);
            }

            return result;
        })
        .then(result => {
            res.status(200).json({
                status: 1,
                message: 'Quotations updated successfully'
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

/* UPDATE status*/
router.post('/update/:id/status', async (req, res, next) => {

    let now = new Date();
    const client = new Client(connectionString);
    await client.connect()
        .then(() => {
            console.log('PG connect with quotation');
            console.log(req.body);
            console.log(req.body.quotation.status);

            const sql = "UPDATE quotations SET updated_at = $1, status = $2 WHERE quotation_id = $3";
            const params = [
                dateFormat(now, "isoDateTime"),
                req.body.quotation.status,
                req.params.id
            ];

            return client.query(sql, params);
        })
        .then(result => {
            res.status(200).json({
                status: 1,
                message: 'Quotation updated'
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

module.exports = router;
