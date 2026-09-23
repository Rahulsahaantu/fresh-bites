const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI || "";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("fresh-bites");
    
    // Find all foods with relative /uploads/ images
    const foodsCollection = db.collection("foods");
    const foods = await foodsCollection.find({ image: { $regex: "^/uploads/" } }).toArray();
    
    for (const food of foods) {
      const newImage = `http://localhost:5000${food.image}`;
      await foodsCollection.updateOne({ _id: food._id }, { $set: { image: newImage } });
    }
    
    console.log(`Updated ${foods.length} images to absolute URLs.`);
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

run();
