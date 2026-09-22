import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");
import "dotenv/config";
import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
const app = express();
const PORT = process.env.PORT || 5000;
// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5001",
    process.env.FRONTEND_URL,
].filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(null, true); // In dev, allow all; tighten in prod
        }
    },
    credentials: true,
}));
app.use(express.json());
// ---------------------------------------------------------------------------
// MongoDB Connection
// ---------------------------------------------------------------------------
const uri = process.env.MONGODB_URI || "";
if (!uri) {
    console.error("❌ MONGODB_URI environment variable is not set!");
    console.error("   Create a .env file with MONGODB_URI=your_connection_string");
}
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
let db;
async function connectDB() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        db = client.db("fresh-bites");
        console.log("✅ Connected to MongoDB successfully!");
        return db;
    }
    catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        throw error;
    }
}
// ---------------------------------------------------------------------------
// Helper: Validate ObjectId
// ---------------------------------------------------------------------------
function isValidObjectId(id) {
    return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}
// ---------------------------------------------------------------------------
// Helper: API Response
// ---------------------------------------------------------------------------
function apiResponse(res, statusCode, message, data = null) {
    return res.status(statusCode).json({
        success: statusCode >= 200 && statusCode < 300,
        message,
        data,
    });
}
// ---------------------------------------------------------------------------
// Routes: Health
// ---------------------------------------------------------------------------
app.get("/", (_req, res) => {
    apiResponse(res, 200, "Fresh Bites API is running 🍔");
});
app.get("/health", (_req, res) => {
    apiResponse(res, 200, "OK");
});
// ---------------------------------------------------------------------------
// Routes: Foods
// ---------------------------------------------------------------------------
app.get("/api/foods", async (req, res) => {
    try {
        const foodsCollection = db.collection("foods");
        const { category, search, sort, limit } = req.query;
        // Build filter
        const filter = {};
        if (category && typeof category === "string" && category !== "all") {
            filter.category = { $regex: new RegExp(`^${category}$`, "i") };
        }
        if (search && typeof search === "string") {
            filter.$or = [
                { name: { $regex: new RegExp(search, "i") } },
                { description: { $regex: new RegExp(search, "i") } },
                { category: { $regex: new RegExp(search, "i") } },
            ];
        }
        // Build sort
        let sortOption = { createdAt: -1 };
        if (sort === "price-asc")
            sortOption = { price: 1 };
        else if (sort === "price-desc")
            sortOption = { price: -1 };
        else if (sort === "rating")
            sortOption = { rating: -1 };
        else if (sort === "name")
            sortOption = { name: 1 };
        const limitNum = limit ? parseInt(limit, 10) : 0;
        let query = foodsCollection.find(filter).sort(sortOption);
        if (limitNum > 0)
            query = query.limit(limitNum);
        const foods = await query.toArray();
        apiResponse(res, 200, "Foods fetched successfully", foods);
    }
    catch (error) {
        console.error("Error fetching foods:", error);
        apiResponse(res, 500, "Failed to fetch foods");
    }
});
app.get("/api/foods/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) {
            return apiResponse(res, 400, "Invalid food ID format");
        }
        const foodsCollection = db.collection("foods");
        const food = await foodsCollection.findOne({ _id: new ObjectId(id) });
        if (!food) {
            return apiResponse(res, 404, "Food not found");
        }
        apiResponse(res, 200, "Food fetched successfully", food);
    }
    catch (error) {
        console.error("Error fetching food:", error);
        apiResponse(res, 500, "Failed to fetch food");
    }
});
app.post("/api/foods", async (req, res) => {
    try {
        const foodsCollection = db.collection("foods");
        const foods = Array.isArray(req.body) ? req.body : [req.body];
        // Validate
        for (const food of foods) {
            if (!food.name || !food.price) {
                return apiResponse(res, 400, "Each food must have a name and price");
            }
        }
        // Add timestamps
        const foodsWithTimestamps = foods.map((f) => ({
            ...f,
            price: Number(f.price),
            rating: f.rating ? Number(f.rating) : 4.5,
            available: f.available !== false,
            createdAt: new Date(),
        }));
        const result = foodsWithTimestamps.length === 1
            ? await foodsCollection.insertOne(foodsWithTimestamps[0])
            : await foodsCollection.insertMany(foodsWithTimestamps);
        apiResponse(res, 201, "Food(s) added successfully", result);
    }
    catch (error) {
        console.error("Error adding food:", error);
        apiResponse(res, 500, "Failed to add food");
    }
});
// Legacy endpoints (backward compat)
app.post("/food", async (req, res) => {
    try {
        const foodsCollection = db.collection("foods");
        const food = req.body;
        if (!food.name || !food.price) {
            return apiResponse(res, 400, "Food must have a name and price");
        }
        const result = await foodsCollection.insertOne({
            ...food,
            price: Number(food.price),
            rating: food.rating ? Number(food.rating) : 4.5,
            available: food.available !== false,
            createdAt: new Date(),
        });
        apiResponse(res, 201, "Food added successfully", result);
    }
    catch (error) {
        console.error("Error adding food:", error);
        apiResponse(res, 500, "Failed to add food");
    }
});
app.post("/foods", async (req, res) => {
    try {
        const foodsCollection = db.collection("foods");
        const foods = req.body;
        const result = await foodsCollection.insertMany(foods);
        apiResponse(res, 201, "Foods added successfully", result);
    }
    catch (error) {
        console.error("Error adding foods:", error);
        apiResponse(res, 500, "Failed to add foods");
    }
});
app.get("/foods", async (_req, res) => {
    try {
        const foodsCollection = db.collection("foods");
        const foods = await foodsCollection.find().toArray();
        apiResponse(res, 200, "Foods fetched successfully", foods);
    }
    catch (error) {
        console.error("Error fetching foods:", error);
        apiResponse(res, 500, "Failed to fetch foods");
    }
});
app.get("/foods/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) {
            return apiResponse(res, 400, "Invalid food ID format");
        }
        const foodsCollection = db.collection("foods");
        const food = await foodsCollection.findOne({ _id: new ObjectId(id) });
        if (!food)
            return apiResponse(res, 404, "Food not found");
        apiResponse(res, 200, "Food fetched successfully", food);
    }
    catch (error) {
        console.error("Error fetching food:", error);
        apiResponse(res, 500, "Failed to fetch food");
    }
});
app.put("/api/foods/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) {
            return apiResponse(res, 400, "Invalid food ID format");
        }
        const foodsCollection = db.collection("foods");
        const updateData = { ...req.body };
        delete updateData._id; // Don't update _id
        const result = await foodsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { ...updateData, updatedAt: new Date() } });
        if (result.matchedCount === 0) {
            return apiResponse(res, 404, "Food not found");
        }
        apiResponse(res, 200, "Food updated successfully", result);
    }
    catch (error) {
        console.error("Error updating food:", error);
        apiResponse(res, 500, "Failed to update food");
    }
});
app.delete("/api/foods/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) {
            return apiResponse(res, 400, "Invalid food ID format");
        }
        const foodsCollection = db.collection("foods");
        const result = await foodsCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return apiResponse(res, 404, "Food not found");
        }
        apiResponse(res, 200, "Food deleted successfully");
    }
    catch (error) {
        console.error("Error deleting food:", error);
        apiResponse(res, 500, "Failed to delete food");
    }
});
// ---------------------------------------------------------------------------
// Routes: Categories
// ---------------------------------------------------------------------------
app.get("/api/categories", async (_req, res) => {
    try {
        const foodsCollection = db.collection("foods");
        const categories = await foodsCollection.distinct("category");
        apiResponse(res, 200, "Categories fetched successfully", categories);
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        apiResponse(res, 500, "Failed to fetch categories");
    }
});
// ---------------------------------------------------------------------------
// Routes: Orders
// ---------------------------------------------------------------------------
app.post("/api/orders", async (req, res) => {
    try {
        const ordersCollection = db.collection("orders");
        const { items, customer, subtotal, deliveryFee, total } = req.body;
        // Validate
        if (!items || !Array.isArray(items) || items.length === 0) {
            return apiResponse(res, 400, "Order must contain at least one item");
        }
        if (!customer || !customer.name || !customer.phone || !customer.address) {
            return apiResponse(res, 400, "Customer name, phone, and address are required");
        }
        const order = {
            items: items.map((item) => ({
                foodId: item.foodId,
                name: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity),
                image: item.image || "",
            })),
            customer: {
                name: customer.name,
                email: customer.email || "",
                phone: customer.phone,
                address: customer.address,
            },
            subtotal: Number(subtotal),
            deliveryFee: Number(deliveryFee),
            total: Number(total),
            status: "confirmed",
            createdAt: new Date(),
        };
        const result = await ordersCollection.insertOne(order);
        apiResponse(res, 201, "Order placed successfully", {
            orderId: result.insertedId,
            ...order,
        });
    }
    catch (error) {
        console.error("Error creating order:", error);
        apiResponse(res, 500, "Failed to create order");
    }
});
app.get("/api/orders/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) {
            return apiResponse(res, 400, "Invalid order ID format");
        }
        const ordersCollection = db.collection("orders");
        const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
        if (!order) {
            return apiResponse(res, 404, "Order not found");
        }
        apiResponse(res, 200, "Order fetched successfully", order);
    }
    catch (error) {
        console.error("Error fetching order:", error);
        apiResponse(res, 500, "Failed to fetch order");
    }
});
app.get("/api/orders", async (_req, res) => {
    try {
        const ordersCollection = db.collection("orders");
        const orders = await ordersCollection.find().sort({ createdAt: -1 }).toArray();
        apiResponse(res, 200, "Orders fetched successfully", orders);
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        apiResponse(res, 500, "Failed to fetch orders");
    }
});
// ---------------------------------------------------------------------------
// Error handling middleware
// ---------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    apiResponse(res, 500, "Internal server error");
});
// 404 handler
app.use((_req, res) => {
    apiResponse(res, 404, "Route not found");
});
// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
connectDB()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📡 API: http://localhost:${PORT}/api/foods`);
    });
})
    .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
export default app;
//# sourceMappingURL=index.js.map