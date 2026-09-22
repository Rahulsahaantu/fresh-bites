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
    
    const foodsCollection = db.collection("foods");
    const foods = await foodsCollection.find({}).toArray();
    
    let updatedCount = 0;
    for (const food of foods) {
      let newPrice = 300;
      
      // Assign realistic BDT prices based on categories or keywords
      const cat = food.category?.toLowerCase() || "";
      const name = food.name?.toLowerCase() || "";
      
      if (cat.includes("burger") || name.includes("burger")) {
        newPrice = name.includes("bacon") || name.includes("double") ? 450 : 350;
      } else if (cat.includes("pizza") || name.includes("pizza")) {
        newPrice = name.includes("supreme") ? 750 : 600;
      } else if (cat.includes("asian") || name.includes("pad thai") || name.includes("ramen")) {
        newPrice = name.includes("ramen") ? 400 : 350;
      } else if (cat.includes("salad")) {
        newPrice = 250;
      } else if (name.includes("bowl")) {
        newPrice = 450;
      } else if (cat.includes("dessert") || name.includes("cake")) {
        newPrice = 200;
      } else if (cat.includes("drink") || name.includes("coffee") || name.includes("smoothie")) {
        newPrice = 150;
      }
      
      await foodsCollection.updateOne(
        { _id: food._id },
        {
          $set: {
            price: newPrice,
          },
        }
      );
      updatedCount++;
    }
    
    console.log(`Updated ${updatedCount} foods with realistic BDT prices.`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

run();
