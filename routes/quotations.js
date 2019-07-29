const express = require('express');
const router = express.Router();
const dateFormat = require('dateformat');

const {Client} = require('pg');

/* GET quotation*/
router.get('/:id', (req, res, next) => {
    const client = new Client();
    client.connect()
        .then(() => {
            const sql = "SELECT quotations.quotation_id, quotations.title, quotations.description, quotations.amount, quotations.terms, quotations.created_at, quotations.updated_at, clients.code " +
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
router.get('/', function (req, res, next) {
    const client = new Client();
    client.connect()
        .then(() => {
            const sql = "SELECT quotations.quotation_id, quotations.title, quotations.description, quotations.amount, " +
                "quotations.terms, quotations.created_at, quotations.updated_at, clients.code" +
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
router.post('/new', function (req, res, next) {

    const client = new Client();
    let now = new Date();

    client.connect()
        .then(() => {
            console.log('PG connect with quotation');
            console.log(req.body);

            const sql = "INSERT INTO quotations (created_at, updated_at, title, description, amount, terms, client_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING quotation_id";
            const params = [
                dateFormat(now, "isoDateTime"),
                dateFormat(now, "isoDateTime"),
                req.body.title,
                req.body.description,
                req.body.amount,
                req.body.terms,
                req.body.client_id
            ];

            return client.query(sql, params);
        })
        .then(result => {
            console.log('PG connect with finance');

            const sql = "INSERT INTO financials (description, amount, quotation_id) VALUES ($1,$2,$3)";
            const quot_id = result.rows[0].quotation_id;

            let fin = req.body.financials;
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

            let rel = req.body.releases;
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

            let pay = req.body.payments;
            let i;
            for (i = 0; i < pay.length; i++) {
                const params = [pay[i].description, pay[i].amount, pay[i].invoice_date,result];
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
router.delete('/remove/:id', function (req, res, next) {
    const client = new Client();
    client.connect()
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
router.post('/update/:id', function (req, res, next) {

    const client = new Client();
    let now = new Date();

    client.connect()
        .then(() => {
            console.log('PG connect with quotation');
            console.log(req.body);

            const sql = "UPDATE quotations SET updated_at = $1, title = $2, description = $3, amount = $4, terms = $5 WHERE quotation_id = $6";
            const params = [
                dateFormat(now, "isoDateTime"),
                req.body.title,
                req.body.description,
                req.body.amount,
                req.body.terms,
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

            let fin = req.body.financials;
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

            let rel = req.body.releases;
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

            let pay = req.body.payments;
            let i;
            for (i = 0; i < pay.length; i++) {
                const params = [pay[i].description, pay[i].amount, pay[i].invoice_date,req.params.id];
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

module.exports = router;
