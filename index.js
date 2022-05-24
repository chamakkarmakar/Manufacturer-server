const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.x5l25.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();

    const productCollection = client.db("dbManufacturer").collection("products");
    const orderCollection = client.db("dbManufacturer").collection("order");
    const reviewCollection = client.db("dbManufacturer").collection("reviews");
     const userCollection = client.db("dbManufacturer").collection("users");

    // load all products
    app.get('/product', async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    })
    // load single product
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });
    // users 
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN,
        { expiresIn: '1d' }
      );
      res.send({result,token});
    });
    // load all review
    app.get('/review', async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    // send review 
    app.post('/review', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });
    // send order 
    app.post('/order', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
    // load orders
    app.get('/order', async (req, res) => {
      const email = req.query.email;
      const query={email : email};
      const orders = await orderCollection.find(query).toArray();
      res.send(orders);
    })

  } finally {

  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Car Parts Manufacturer')
})

app.listen(port, () => {
  console.log(`Car Parts Manufacturer Listening on port ${port}`)
})