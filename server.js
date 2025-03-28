import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';
import ngrok from 'ngrok';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',  // React development server
    'https://localhost:3000',
    process.env.FRONTEND_URL  // Optional production frontend URL
  ]
}));
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://st290130:Nrs%40tyam12345@cluster0.fa9rdny.mongodb.net/?retryWrites=true&w=majority';
const DB_NAME = process.env.DB_NAME || "medicine";
const COLLECTION_NAME = process.env.COLLECTION_NAME || "data";
const ITEMS_PER_PAGE = 20;

let client;
let ngrokUrl;

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
    await collection.createIndex({ "Medicine Name": 1 });
    await collection.createIndex({ "Brand Name": 1 });
    
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Expose server via ngrok
async function exposeViaNoNgrok() {
  try {
    ngrokUrl = await ngrok.connect({
      addr: PORT,
      authtoken: process.env.NGROK_AUTHTOKEN  // Optional: Add your ngrok auth token
    });
    console.log(`Ngrok tunnel opened at: ${ngrokUrl}`);
    return ngrokUrl;
  } catch (error) {
    console.error('Ngrok error:', error);
    return null;
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
app.get('/api/medicines/search', async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Complex search query supporting multiple fields
    const searchQuery = query ? {
      $or: [
        { "Medicine Name": { $regex: query, $options: 'i' } },
        { "Brand Name": { $regex: query, $options: 'i' } },
        { "Description": { $regex: query, $options: 'i' } }
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

// Ngrok health check
app.get('/ngrok-health', (req, res) => {
  res.json({
    status: 'healthy',
    ngrokUrl: ngrokUrl || 'Not exposed'
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
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Optional: Expose via ngrok
    if (process.env.EXPOSE_NGROK === 'true') {
      await exposeViaNoNgrok();
    }

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down gracefully');
      await client.close();
      if (ngrokUrl) await ngrok.disconnect();
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
