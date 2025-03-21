import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = "mongodb+srv://st290130:Nrs%40tyam12345@cluster0.fa9rdny.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "medicine";
const COLLECTION_NAME = "data";
const ITEMS_PER_PAGE = 20;

let client: MongoClient;

async function connectToDatabase() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    // Create indexes for better search performance
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    await collection.createIndex({ "Medicine Name": "text", "Brand Name": "text" });
    await collection.createIndex({ "Medicine Name": 1 });
    await collection.createIndex({ "Brand Name": 1 });
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Get paginated medicines
app.get('/api/medicines', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
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

// Optimized search with pagination
app.get('/api/medicines/search', async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const searchQuery = {
      $or: [
        { "Medicine Name": { $regex: query, $options: 'i' } },
        { "Brand Name": { $regex: query, $options: 'i' } }
      ]
    };

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

const PORT = 5000;

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});