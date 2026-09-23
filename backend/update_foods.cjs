const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI || "";
if (!uri) {
  console.error("No MONGODB_URI found");
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("fresh-bites");
    const foodsCollection = db.collection("foods");
    
    // Update all foods that don't have an adminEmail to belong to rahul0243@gmail.com
    const result = await foodsCollection.updateMany(
      { adminEmail: { $exists: false } },
      { $set: { adminEmail: "rahul0243@gmail.com" } }
    );
    
    console.log(`Successfully updated ${result.modifiedCount} foods to belong to rahul0243@gmail.com.`);
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

run();
