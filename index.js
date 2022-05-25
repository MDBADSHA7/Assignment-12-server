const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cy5vv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('manufacture_website').collection('services');
        const bookingCollection = client.db('manufacture_website').collection('bookings');
        const userCollection = client.db('manufacture_website').collection('users');

        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET)
            res.send({ result, AccessToken: token });
            console.log(token, process.env.ACCESS_TOKEN_SECRET)
        })

        app.get('/booking', async (req, res) => {
            const query = {};
            const authorization = req.headers.authorization;
            console.log('auth header', authorization);
            const cursor = bookingCollection.find(query);
            const bookings = await cursor.toArray();
            res.send(bookings);
            // const customerName = req.query.customerName;
            // const query = { customerName: customerName };
            // const bookings = await bookingCollection.find(query).toArray();
            // res.send(bookings);
        })

        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const query = { purcesName: booking.purcesName, customerName: booking.customerName }
            const exixts = await bookingCollection.findOne(query);
            if (exixts) {
                return res.send({ success: false, booking: exixts })
            }
            const result = await bookingCollection.insertOne(booking);
            return res.send({ success: true, result });
        })

    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Hello From Manufacture Website!')
})

app.listen(port, () => {
    console.log(`Manufacture app listening on port ${port}`)
})