require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const omise = require('omise')({
    publicKey: process.env.OMISE_PUBLIC_KEY,
    secretKey: process.env.OMISE_SECRET_KEY,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/checkout-credit-card', async (req, res, next) => {
    const { email, name, amount, token } = req.body;
    try {
        const customer = await omise.customers.create({
            email: email,
            description: name,
            card: token
        });

        const charge = await omise.charges.create({
            amount,
            currency: 'thb',
            customer: customer.id
        });

        res.send({
            amount: charge.amount,
            status: charge.status,
        });
    } catch (err) {
        console.log(err);
    }

    next();
});

app.post("/checkout-internet-banking", async (req, res, next) => {
    const { email, name, amount, token } = req.body;
    try {
        const charge = await omise.charges.create({
            amount,
            source: token,
            currency: 'thb',
            return_uri: "http://localhost:3000/message"
        });

        res.send({
            authorizeUri: charge.authorize_uri,
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/webhooks", async (req, res, next) => {
    try {
        const { data, key } = req.body;
        console.log(req.body)
        if (key === 'charge.complete') {
            if (data.status === "successful" || data.status === "failed") {
                const charge = {
                    id: data.id,
                    status: data.status,
                    amount: data.funding_amount,
                };
                console.log({ data });
                // SAVE TO DATABASE;
            }
        }
    } catch (err) {
        console.log(err);
    }
});

app.get("/bank-charge", async (req, res, next) => {

});

app.listen(8000, () => {
    console.log("Server is running.");
});