const express = require('express');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5001;

// MongoDB connection for device search
const mongoUri = "mongodb://localhost:27017"; // MongoClient connection string
const client = new MongoClient(mongoUri);

// MongoDB connection for user registration
mongoose.connect('mongodb://localhost:27017/techtally', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongoose connected to MongoDB'))
  .catch(err => console.error('Mongoose connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const corsOptions = {
    origin: 'http://127.0.0.1:5500',  // Change this to the exact URL of your frontend
  };
  app.use(cors(corsOptions));

// Device Search Route
app.get('/api/search/mobile', async (req, res) => {
  try {
    const query = req.query.q;
    const db = client.db("techtally");
    const collection = db.collection("device_mobile");

    const devices = await collection.aggregate([
      { $unwind: "$models" },
      { $match: { "models.model_name": { $regex: query, $options: 'i' } } },
      { $project: { _id: 0, "models": 1 } }
    ]).toArray();

    
    res.json(devices.map(device => device.models));
  } catch (error) {
    console.error("Error searching devices:", error);
    res.status(500).json({ error: "An error occurred while searching devices" });
  }
});

app.get('/api/search/laptop', async (req, res) => {
  try {
    const query = req.query.q;
    const db = client.db("techtally");
    const collection = db.collection("device_laptop");

    const devices = await collection.aggregate([
      { $unwind: "$models" },
      { $match: { "models.Name": { $regex: query, $options: 'i' } } },
      { $project: { _id: 0, "models": 1 } }
    ]).toArray();

    res.json(devices.map(device => device.models));
  } catch (error) {
    console.error("Error searching devices:", error);
    res.status(500).json({ error: "An error occurred while searching devices" });
  }
});

app.get('/api/search/tab', async (req, res) => {
  try {
    const query = req.query.q;
    const db = client.db("techtally");
    const collection = db.collection("device_tab");

    const devices = await collection.aggregate([
      { $unwind: "$models" },
      { $match: { "models.Name": { $regex: query, $options: 'i' } } },
      { $project: { _id: 0, "models": 1 } }
    ]).toArray();

    res.json(devices.map(device => device.models));
  } catch (error) {
    console.error("Error searching devices:", error);
    res.status(500).json({ error: "An error occurred while searching devices" });
  }
});

// User Registration Schema and Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('Registration', userSchema);

// User Registration Route
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});

// Start server and MongoDB client connection
async function startServer() {
  try {
    await client.connect();
    console.log("MongoClient connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();
