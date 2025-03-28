import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'https://2d4c-34-16-141-182.ngrok-free.app'
  ]
}));

app.use(express.json());

// Configuration
const PORT = process.env.PORT || 4000;
const MONGODB_URI = "mongodb+srv://st290130:Nrs%40tyam12345@cluster0.fa9rdny.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "medicine";
const COLLECTION_NAME = "data";
const ITEMS_PER_PAGE = 20;

let client;

// Database Connection
async function connectToDatabase() {
  try {
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    // Create indexes for better search performance
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    await collection.createIndex({ "Medicine Name": "text", "Brand Name": "text" });
    
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Paginated Medicines Endpoint
app.get('/api/medicines', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const [medicines, total] = await Promise.all([
      collection
        .find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .toArray(),
      collection.countDocuments({})
    ]);
    
    res.json({
      medicines,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
      currentPage: page,
      totalItems: total
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Optimized Search Endpoint
app.get('/search', async (req, res) => {
  try {
    const { medicine } = req.query;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Complex search query supporting multiple fields
    const searchQuery = medicine ? {
      $or: [
        { "Medicine Name": { $regex: medicine, $options: 'i' } },
        { "Brand Name": { $regex: medicine, $options: 'i' } }
      ]
    } : {};
    
    const medicines = await collection
      .find(searchQuery)
      .limit(20)
      .toArray();
    
    res.json(medicines.map(med => med["Medicine Name"]));
  } catch (error) {
    console.error('Error searching medicines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Additional Search Endpoint for Full Details
app.get('/api/medicines/search', async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const searchQuery = query ? {
      $or: [
        { "Medicine Name": { $regex: query, $options: 'i' } },
        { "Brand Name": { $regex: query, $options: 'i' } }
      ]
    } : {};
    
    const [medicines, total] = await Promise.all([
      collection
        .find(searchQuery)
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .toArray(),
      collection.countDocuments(searchQuery)
    ]);
    
    res.json({
      medicines,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
      currentPage: page,
      totalItems: total
    });
  } catch (error) {
    console.error('Error searching medicines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ngrok Health Check
app.get('/ngrok-health', (req, res) => {
  res.json({
    status: 'healthy',
    ngrokUrl: 'https://2d4c-34-16-141-182.ngrok-free.app'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Server Startup
async function startServer() {
  try {
    await connectToDatabase();
    
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Ngrok URL: https://2d4c-34-16-141-182.ngrok-free.app`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down gracefully');
      await client.close();
      server.close(() => process.exit(0));
    });

  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

// Execute server startup
startServer();

export default app;
