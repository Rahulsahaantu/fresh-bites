import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "";
const DB_NAME = "fresh-bites";

async function run() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Update foods
    const foodsCollection = db.collection("foods");
    const foods = await foodsCollection.find({}).toArray();
    
    let updatedCount = 0;
    for (const food of foods) {
      if (!food.adminEmail) {
        // Assume existing foods are in USD (e.g. 12.99), multiply by 120 and round
        const newPrice = Math.round(food.price * 120);
        await foodsCollection.updateOne(
          { _id: food._id },
          {
            $set: {
              price: newPrice,
              adminEmail: "rahul0243@gmail.com",
              restaurantName: "Fresh Bites (Default)",
              location: "Rangunia, Chittagong",
            },
          }
        );
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} foods with BDT prices and default vendor.`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

run();
