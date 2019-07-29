const express = require('express');
const router = express.Router();

const {Client} = require('pg');

// /* GET quotation*/
// router.get('/:id', (req, res, next) => {
//     const client = new Client();
//     client.connect()
//         .then(() => {
//             const sql = "SELECT * FROM clients WHERE client_id = $1";
//             const params = [req.params.id];
//
//             return client.query(sql, params);
//         })
//         .then(result => {
//             if (result.rows.length === 0) {
//                 res.status(200).json({
//                     status: 1,
//                     message: 'No client found'
//                 });
//             } else {
//                 res.status(200).json({
//                     status: 1,
//                     message: 'Available details',
//                     content: {
//                         clients: result.rows[0]
//                     }
//                 });
//             }
//         })
//         .catch(e => {
//             res.status(400).json({
//                 status: 0,
//                 message: 'Something went wrong',
//                 content: {
//                     error: e
//                 }
//             });
//         })
// });
//
// /* GET quotations*/
// router.get('/', function (req, res, next) {
//     const client = new Client();
//     client.connect()
//         .then(() => {
//             const sql = "SELECT * FROM clients";
//             return client.query(sql);
//         })
//         .then(result => {
//             if (result.rows.length === 0) {
//                 res.status(200).json({
//                     status: 1,
//                     message: 'No client found'
//                 });
//             } else {
//                 res.status(200).json({
//                     status: 1,
//                     message: 'Available clients',
//                     content: {
//                         clients: result.rows
//                     }
//                 });
//             }
//         })
//         .catch(e => {
//             res.status(400).json({
//                 status: 0,
//                 message: 'Something went wrong',
//                 content: {
//                     error: e
//                 }
//             });
//         })
// });

/* POST quotation*/
router.post('/new', function (req, res, next) {

    const client = new Client();
    client.connect()
        .then(() => {
            console.log('PG connect with quotation');
            console.log(req.body);

            const sql = "INSERT INTO quotations (created_at, updated_at, title, description, amount, terms, client_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING quotation_id";
            const params = [
                "2019-07-28T21:19:01Z",
                "2019-07-28T21:19:01Z",
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
//
// /* DELETE quotation*/
// router.delete('/remove/:id', function (req, res, next) {
//     const client = new Client();
//     client.connect()
//         .then(() => {
//             const sql = "DELETE FROM clients WHERE client_id = $1";
//             const params = [req.params.id];
//
//             return client.query(sql, params);
//         })
//         .then(result => {
//             res.status(200).json({
//                 status: 1,
//                 message: 'Client deleted successfully'
//             });
//         })
//         .catch(e => {
//             res.status(400).json({
//                 status: 0,
//                 message: 'Something went wrong',
//                 content: {
//                     error: e
//                 }
//             });
//         })
// });
//
// /* UPDATE quotation*/
// router.post('/update/:id', function (req, res, next) {
//
//     const client = new Client();
//     client.connect()
//         .then(() => {
//             console.log('PG connect with client');
//             console.log(req.body);
//
//             const sql = "UPDATE clients SET name = $1, code = $2, email = $3, contact_number = $4, address_line_first = $5, address_line_last = $6, country = $7, description = $8 WHERE client_id = $9";
//             const params = [
//                 req.body.name,
//                 req.body.code,
//                 req.body.email,
//                 req.body.contact_number,
//                 req.body.address_line_first,
//                 req.body.address_line_last,
//                 req.body.country,
//                 req.body.description,
//                 req.params.id
//             ];
//
//             return client.query(sql, params);
//         })
//         .then(result => {
//             res.status(200).json({
//                 status: 1,
//                 message: 'Updated successfully'
//             })
//         })
//         .catch(e => {
//             res.status(400).json({
//                 status: 0,
//                 message: 'Something went wrong',
//                 content: {
//                     error: e
//                 }
//             });
//         });
// });

module.exports = router;
