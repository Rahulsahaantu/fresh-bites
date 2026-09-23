const fs = require('fs');
const {MongoClient} = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('fresh-bites');
  const food = await db.collection('foods').findOne({name: 'khashir mangsho'});
  
  if(food && food.image.startsWith('/uploads')) {
    const filePath = '.' + food.image;
    if (fs.existsSync(filePath)) {
      const base64 = fs.readFileSync(filePath).toString('base64');
      const ext = filePath.split('.').pop();
      const dataUri = 'data:image/' + ext + ';base64,' + base64;
      await db.collection('foods').updateOne({_id: food._id}, {$set: {image: dataUri}});
      console.log('Converted to Base64!');
    } else {
      console.log('File not found: ' + filePath);
    }
  } else {
    console.log('Food not found or already Base64');
  }
  await client.close();
}
run();
