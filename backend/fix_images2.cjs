const { MongoClient } = require("mongodb");
require("dotenv").config();
async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("fresh-bites");
  await db.collection("foods").updateMany(
    { image: { $regex: "^http://localhost:5000" } },
    { $set: { image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop" } }
  );
  console.log("Fixed broken localhost images");
  await client.close();
}
run();
