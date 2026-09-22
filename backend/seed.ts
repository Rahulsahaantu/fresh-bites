import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

import "dotenv/config";
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI || "";
if (!uri) {
  console.error("❌ MONGODB_URI not set. Create a .env file.");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

const foods = [
  {
    name: "Classic Smash Burger",
    description: "Double-smashed beef patties with melted American cheese, caramelized onions, pickles, and our secret sauce on a toasted brioche bun.",
    price: 12.99,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
    available: true,
    rating: 4.8,
    reviews: 234,
    tags: ["popular", "bestseller"],
    ingredients: ["Beef Patty", "American Cheese", "Brioche Bun", "Pickles", "Caramelized Onions", "Secret Sauce"],
  },
  {
    name: "Bacon BBQ Burger",
    description: "Juicy beef patty topped with crispy bacon, cheddar cheese, BBQ sauce, lettuce, and tomato on a sesame bun.",
    price: 14.49,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&h=400&fit=crop",
    available: true,
    rating: 4.6,
    reviews: 189,
    tags: ["trending"],
    ingredients: ["Beef Patty", "Bacon", "Cheddar Cheese", "BBQ Sauce", "Lettuce", "Tomato"],
  },
  {
    name: "Margherita Pizza",
    description: "Traditional Neapolitan pizza with San Marzano tomato sauce, fresh mozzarella, basil, and extra virgin olive oil on a wood-fired crust.",
    price: 15.99,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&h=400&fit=crop",
    available: true,
    rating: 4.9,
    reviews: 312,
    tags: ["popular", "top-rated"],
    ingredients: ["Pizza Dough", "San Marzano Tomatoes", "Fresh Mozzarella", "Basil", "Olive Oil"],
  },
  {
    name: "Pepperoni Supreme",
    description: "Loaded with premium pepperoni, mozzarella, parmesan, and a hint of chili flakes on our signature thin crust.",
    price: 17.49,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop",
    available: true,
    rating: 4.7,
    reviews: 276,
    tags: ["popular"],
    ingredients: ["Pizza Dough", "Mozzarella", "Pepperoni", "Parmesan", "Chili Flakes", "Tomato Sauce"],
  },
  {
    name: "Pad Thai Noodles",
    description: "Stir-fried rice noodles with shrimp, tofu, bean sprouts, peanuts, and tamarind sauce, garnished with lime and cilantro.",
    price: 13.99,
    category: "Asian",
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&h=400&fit=crop",
    available: true,
    rating: 4.5,
    reviews: 198,
    tags: ["trending"],
    ingredients: ["Rice Noodles", "Shrimp", "Tofu", "Bean Sprouts", "Peanuts", "Tamarind Sauce"],
  },
  {
    name: "Chicken Teriyaki Bowl",
    description: "Grilled chicken thigh glazed with homemade teriyaki sauce, served over steamed rice with edamame, pickled ginger, and sesame seeds.",
    price: 14.49,
    category: "Asian",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
    available: true,
    rating: 4.6,
    reviews: 167,
    tags: ["popular"],
    ingredients: ["Chicken Thigh", "Teriyaki Sauce", "Steamed Rice", "Edamame", "Pickled Ginger"],
  },
  {
    name: "Spicy Ramen",
    description: "Rich tonkotsu broth with chashu pork, soft-boiled egg, bamboo shoots, nori, and green onions. Customizable spice level.",
    price: 16.99,
    category: "Asian",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop",
    available: true,
    rating: 4.8,
    reviews: 245,
    tags: ["top-rated", "trending"],
    ingredients: ["Tonkotsu Broth", "Chashu Pork", "Ramen Noodles", "Soft-Boiled Egg", "Nori", "Bamboo Shoots"],
  },
  {
    name: "Mediterranean Quinoa Bowl",
    description: "Fluffy quinoa with roasted chickpeas, cherry tomatoes, cucumber, kalamata olives, feta cheese, and lemon-herb dressing.",
    price: 12.49,
    category: "Salads",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop",
    available: true,
    rating: 4.4,
    reviews: 143,
    tags: ["healthy"],
    ingredients: ["Quinoa", "Chickpeas", "Cherry Tomatoes", "Cucumber", "Feta Cheese", "Olives"],
  },
  {
    name: "Caesar Salad",
    description: "Crisp romaine lettuce, shaved parmesan, garlic croutons, and our house-made Caesar dressing. Add grilled chicken or shrimp.",
    price: 11.99,
    category: "Salads",
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&h=400&fit=crop",
    available: true,
    rating: 4.3,
    reviews: 112,
    tags: [],
    ingredients: ["Romaine Lettuce", "Parmesan", "Croutons", "Caesar Dressing"],
  },
  {
    name: "Avocado Poke Bowl",
    description: "Fresh ahi tuna, ripe avocado, mango, edamame, and crispy shallots over sushi rice with spicy mayo and ponzu.",
    price: 16.49,
    category: "Salads",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop",
    available: true,
    rating: 4.7,
    reviews: 201,
    tags: ["popular", "healthy"],
    ingredients: ["Ahi Tuna", "Avocado", "Mango", "Sushi Rice", "Edamame", "Spicy Mayo"],
  },
  {
    name: "Tiramisu",
    description: "Classic Italian dessert with layers of espresso-soaked ladyfingers, mascarpone cream, and a dusting of cocoa powder.",
    price: 8.99,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop",
    available: true,
    rating: 4.9,
    reviews: 287,
    tags: ["top-rated", "bestseller"],
    ingredients: ["Mascarpone", "Ladyfingers", "Espresso", "Cocoa Powder", "Eggs"],
  },
  {
    name: "New York Cheesecake",
    description: "Creamy, dense cheesecake with a buttery graham cracker crust, topped with fresh strawberry compote.",
    price: 7.99,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop",
    available: true,
    rating: 4.6,
    reviews: 178,
    tags: ["popular"],
    ingredients: ["Cream Cheese", "Graham Crackers", "Butter", "Sugar", "Strawberries"],
  },
  {
    name: "Chocolate Lava Cake",
    description: "Warm, rich chocolate cake with a molten center, served with vanilla bean ice cream and fresh berries.",
    price: 9.49,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop",
    available: true,
    rating: 4.8,
    reviews: 256,
    tags: ["trending"],
    ingredients: ["Dark Chocolate", "Butter", "Eggs", "Flour", "Vanilla Ice Cream"],
  },
  {
    name: "Mango Smoothie",
    description: "Refreshing blend of ripe mangoes, Greek yogurt, honey, and a splash of coconut milk. Naturally sweet and creamy.",
    price: 6.49,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&h=400&fit=crop",
    available: true,
    rating: 4.5,
    reviews: 134,
    tags: ["healthy"],
    ingredients: ["Mango", "Greek Yogurt", "Honey", "Coconut Milk"],
  },
  {
    name: "Iced Matcha Latte",
    description: "Premium ceremonial-grade matcha whisked with oat milk and lightly sweetened. Served over ice.",
    price: 5.99,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&h=400&fit=crop",
    available: true,
    rating: 4.4,
    reviews: 98,
    tags: ["trending"],
    ingredients: ["Ceremonial Matcha", "Oat Milk", "Cane Sugar", "Ice"],
  },
  {
    name: "Crispy Fried Chicken",
    description: "Southern-style buttermilk fried chicken, seasoned with a secret blend of 11 herbs and spices. Served with coleslaw and honey biscuit.",
    price: 13.49,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop",
    available: true,
    rating: 4.7,
    reviews: 221,
    tags: ["popular", "bestseller"],
    ingredients: ["Chicken", "Buttermilk", "Flour", "Herbs & Spices", "Coleslaw", "Honey Biscuit"],
  },
];

async function seed() {
  try {
    await client.connect();
    const db = client.db("fresh-bites");
    const foodsCollection = db.collection("foods");

    // Clear existing foods
    await foodsCollection.deleteMany({});
    console.log("🗑️  Cleared existing foods");

    // Insert seed data with timestamps
    const foodsWithTimestamps = foods.map((f) => ({
      ...f,
      createdAt: new Date(),
    }));

    const result = await foodsCollection.insertMany(foodsWithTimestamps);
    console.log(`🌱 Seeded ${result.insertedCount} foods successfully!`);

    // Create text index for search
    await foodsCollection.createIndex({ name: "text", description: "text", category: "text" });
    console.log("📇 Created text search index");

    // List categories
    const categories = await foodsCollection.distinct("category");
    console.log(`📂 Categories: ${categories.join(", ")}`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seed();
