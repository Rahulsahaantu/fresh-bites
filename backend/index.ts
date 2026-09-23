import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

import "dotenv/config";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MongoClient, ObjectId, ServerApiVersion, type Db } from "mongodb";
import multer from "multer";
import path from "path";
import fs from "fs";
import SSLCommerzPayment from "sslcommerz-lts";

const app: Express = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// SSLCommerz Configuration
// ---------------------------------------------------------------------------
// Credentials are read directly from process.env in the SSLCommerzPayment
// constructor (STORE_ID, STORE_PASS, IS_LIVE) — see the order creation route.

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5001",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // In dev, allow all; tighten in prod
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

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

let db: Db;

async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    db = client.db("fresh-bites");
    console.log("✅ Connected to MongoDB successfully!");
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Helper: Validate ObjectId
// ---------------------------------------------------------------------------
function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

// ---------------------------------------------------------------------------
// Helper: API Response
// ---------------------------------------------------------------------------
function apiResponse(res: Response, statusCode: number, message: string, data: unknown = null) {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
  });
}

// ---------------------------------------------------------------------------
// Auth Middleware & Routes
// ---------------------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    apiResponse(res, 401, "Access denied. No token provided.");
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    apiResponse(res, 403, "Invalid token.");
  }
};

const verifyAdmin = (req: Request, res: Response, next: NextFunction): void => {
  verifyToken(req, res, () => {
    if ((req as any).user?.role !== "admin") {
      apiResponse(res, 403, "Access denied. Requires admin privileges.");
      return;
    }
    next();
  });
};

// ---------------------------------------------------------------------------
// Routes: Upload
// ---------------------------------------------------------------------------
app.post("/api/upload", upload.single("image"), (req: Request, res: Response) => {
  if (!req.file) {
    return apiResponse(res, 400, "No file uploaded");
  }
  const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  apiResponse(res, 200, "File uploaded successfully", { url: base64Image });
});

// ---------------------------------------------------------------------------
// Routes: Auth
// ---------------------------------------------------------------------------
app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const usersCollection = db.collection("users");
    const { name, email, password, role: requestedRole, restaurantName, location } = req.body;
    if (!name || !email || !password) return apiResponse(res, 400, "Please provide all fields");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) return apiResponse(res, 400, "Email already in use");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const count = await usersCollection.countDocuments();
    let role = count === 0 ? "admin" : "customer";
    if (count > 0 && requestedRole === "admin") {
      role = "admin";
    } else if (count > 0 && requestedRole === "customer") {
      role = "customer";
    }

    const newUser: any = { name, email, password: hashedPassword, role, createdAt: new Date() };
    if (role === "admin") {
      newUser.restaurantName = restaurantName || "Fresh Bites";
      newUser.location = location || "Unknown";
    }
    
    const result = await usersCollection.insertOne(newUser);
    const token = jwt.sign({ id: result.insertedId, role }, JWT_SECRET, { expiresIn: "7d" });

    apiResponse(res, 201, "User registered successfully", { token, user: { id: result.insertedId, name, email, role, restaurantName: newUser.restaurantName, location: newUser.location } });
  } catch (error) {
    apiResponse(res, 500, "Error registering user");
  }
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const usersCollection = db.collection("users");
    const { email, password } = req.body;
    if (!email || !password) return apiResponse(res, 400, "Please provide email and password");

    const user = await usersCollection.findOne({ email });
    if (!user) return apiResponse(res, 401, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) return apiResponse(res, 401, "Invalid credentials");

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    apiResponse(res, 200, "Logged in successfully", { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    apiResponse(res, 500, "Error logging in");
  }
});

app.get("/api/auth/me", verifyToken, async (req: Request, res: Response) => {
  try {
    const usersCollection = db.collection("users");
    const userId = (req as any).user.id;
    const user = await usersCollection.findOne({ _id: new ObjectId(userId as string) });
    if (!user) return apiResponse(res, 404, "User not found");

    apiResponse(res, 200, "User fetched", { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      profileImage: user.profileImage,
      restaurantName: user.restaurantName,
      location: user.location
    });
  } catch (error) {
    apiResponse(res, 500, "Error fetching user");
  }
});

app.put("/api/auth/profile", verifyToken, async (req: Request, res: Response) => {
  try {
    const usersCollection = db.collection("users");
    const userId = (req as any).user.id;
    const { profileImage } = req.body;
    
    await usersCollection.updateOne(
      { _id: new ObjectId(userId as string) },
      { $set: { profileImage } }
    );
    
    apiResponse(res, 200, "Profile updated");
  } catch (error) {
    apiResponse(res, 500, "Error updating profile");
  }
});

// ---------------------------------------------------------------------------
// Routes: Health
// ---------------------------------------------------------------------------
app.get("/", (_req: Request, res: Response) => {
  apiResponse(res, 200, "Fresh Bites API is running 🍔");
});

app.get("/health", (_req: Request, res: Response) => {
  apiResponse(res, 200, "OK");
});

// ---------------------------------------------------------------------------
// Routes: Foods
// ---------------------------------------------------------------------------
app.get("/api/foods", async (req: Request, res: Response) => {
  try {
    const foodsCollection = db.collection("foods");
    const { category, search, sort, limit, vendor } = req.query;

    // Build filter
    const filter: Record<string, unknown> = {};
    
    if (vendor && typeof vendor === "string" && vendor !== "all") {
      filter.adminEmail = vendor;
    }

    if (category && typeof category === "string" && category !== "all") {
      filter.category = { $regex: new RegExp(category, "i") };
    }
    if (search && typeof search === "string") {
      filter.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
        { category: { $regex: new RegExp(search, "i") } },
      ];
    }

    // Build sort
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "price-asc") sortOption = { price: 1 };
    else if (sort === "price-desc") sortOption = { price: -1 };
    else if (sort === "rating") sortOption = { rating: -1 };
    else if (sort === "name") sortOption = { name: 1 };

    const limitNum = limit ? parseInt(limit as string, 10) : 0;

    let query = foodsCollection.find(filter).sort(sortOption);
    if (limitNum > 0) query = query.limit(limitNum);

    const foods = await query.toArray();
    apiResponse(res, 200, "Foods fetched successfully", foods);
  } catch (error) {
    console.error("Error fetching foods:", error);
    apiResponse(res, 500, "Failed to fetch foods");
  }
});

app.get("/api/foods/my-foods", verifyAdmin, async (req: Request, res: Response) => {
  try {
    const usersCollection = db.collection("users");
    const foodsCollection = db.collection("foods");
    const userId = (req as any).user.id;
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) return apiResponse(res, 404, "User not found");

    const filter = { adminEmail: user.email };
    const foods = await foodsCollection.find(filter).sort({ createdAt: -1 }).toArray();
    apiResponse(res, 200, "My foods fetched successfully", foods);
  } catch (error) {
    console.error("Error fetching my foods:", error);
    apiResponse(res, 500, "Failed to fetch foods");
  }
});

app.get("/api/foods/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return apiResponse(res, 400, "Invalid food ID format");
    }

    const foodsCollection = db.collection("foods");
    const food = await foodsCollection.findOne({ _id: new ObjectId(id) });

    if (!food) {
      return apiResponse(res, 404, "Food not found");
    }

    apiResponse(res, 200, "Food fetched successfully", food);
  } catch (error) {
    console.error("Error fetching food:", error);
    apiResponse(res, 500, "Failed to fetch food");
  }
});

app.post("/api/foods", verifyAdmin, async (req: Request, res: Response) => {
  try {
    const usersCollection = db.collection("users");
    const foodsCollection = db.collection("foods");
    const foods = Array.isArray(req.body) ? req.body : [req.body];
    
    const userId = (req as any).user.id;
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) return apiResponse(res, 404, "User not found");

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
      adminEmail: user.email,
      restaurantName: user.restaurantName || "Fresh Bites",
      location: user.location || "Unknown",
      createdAt: new Date(),
    }));

    const result =
      foodsWithTimestamps.length === 1
        ? await foodsCollection.insertOne(foodsWithTimestamps[0])
        : await foodsCollection.insertMany(foodsWithTimestamps);

    apiResponse(res, 201, "Food(s) added successfully", result);
  } catch (error) {
    console.error("Error adding food:", error);
    apiResponse(res, 500, "Failed to add food");
  }
});

// Legacy endpoints (backward compat)
app.post("/food", verifyAdmin, async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error("Error adding food:", error);
    apiResponse(res, 500, "Failed to add food");
  }
});

app.post("/foods", verifyAdmin, async (req: Request, res: Response) => {
  try {
    const foodsCollection = db.collection("foods");
    const foods = req.body;
    const result = await foodsCollection.insertMany(foods);
    apiResponse(res, 201, "Foods added successfully", result);
  } catch (error) {
    console.error("Error adding foods:", error);
    apiResponse(res, 500, "Failed to add foods");
  }
});

app.get("/foods", async (_req: Request, res: Response) => {
  try {
    const foodsCollection = db.collection("foods");
    const foods = await foodsCollection.find().toArray();
    apiResponse(res, 200, "Foods fetched successfully", foods);
  } catch (error) {
    console.error("Error fetching foods:", error);
    apiResponse(res, 500, "Failed to fetch foods");
  }
});

app.get("/foods/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return apiResponse(res, 400, "Invalid food ID format");
    }
    const foodsCollection = db.collection("foods");
    const food = await foodsCollection.findOne({ _id: new ObjectId(id) });
    if (!food) return apiResponse(res, 404, "Food not found");
    apiResponse(res, 200, "Food fetched successfully", food);
  } catch (error) {
    console.error("Error fetching food:", error);
    apiResponse(res, 500, "Failed to fetch food");
  }
});

app.put("/api/foods/:id", verifyAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return apiResponse(res, 400, "Invalid food ID format");
    }

    const foodsCollection = db.collection("foods");
    const updateData = { ...req.body };
    delete updateData._id; // Don't update _id

    const result = await foodsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return apiResponse(res, 404, "Food not found");
    }

    apiResponse(res, 200, "Food updated successfully", result);
  } catch (error) {
    console.error("Error updating food:", error);
    apiResponse(res, 500, "Failed to update food");
  }
});

app.delete("/api/foods/:id", verifyAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return apiResponse(res, 400, "Invalid food ID format");
    }

    const foodsCollection = db.collection("foods");
    const result = await foodsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return apiResponse(res, 404, "Food not found");
    }

    apiResponse(res, 200, "Food deleted successfully");
  } catch (error) {
    console.error("Error deleting food:", error);
    apiResponse(res, 500, "Failed to delete food");
  }
});

// ---------------------------------------------------------------------------
// Routes: Categories
// ---------------------------------------------------------------------------
app.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    const foodsCollection = db.collection("foods");
    const categories = await foodsCollection.distinct("category");
    apiResponse(res, 200, "Categories fetched successfully", categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    apiResponse(res, 500, "Failed to fetch categories");
  }
});

// ---------------------------------------------------------------------------
// Routes: Orders
// ---------------------------------------------------------------------------
app.post("/api/orders", async (req: Request, res: Response) => {
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

    const foodIds = items.map((i: any) => new ObjectId(i.foodId));
    const foods = await db.collection("foods").find({ _id: { $in: foodIds } }).toArray();

    const enrichedItems = items.map((item: any) => {
      const food = foods.find(f => f._id.toString() === item.foodId);
      return {
        foodId: item.foodId,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image || "",
        adminEmail: food?.adminEmail || "rahul0243@gmail.com",
      };
    });

    const vendorEmails = [...new Set(enrichedItems.map((i: any) => i.adminEmail).filter(Boolean))];

    const order = {
      items: enrichedItems,
      vendorEmails,
      customer: {
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone,
        address: customer.address,
      },
      subtotal: Number(subtotal),
      deliveryFee: Number(deliveryFee),
      total: Number(total),
      status: "pending", // Initially pending for payment
      createdAt: new Date(),
    };

    const result = await ordersCollection.insertOne(order);
    const orderId = result.insertedId.toString();

    // SSL Commerz Initialization
    const data = {
        total_amount: order.total,
        currency: 'BDT',
        tran_id: orderId, // use orderId as tran_id
        success_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/success?tran_id=${orderId}`,
        fail_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/fail?tran_id=${orderId}`,
        cancel_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/cancel?tran_id=${orderId}`,
        ipn_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/ipn`,
        shipping_method: 'Courier',
        product_name: 'Food Order',
        product_category: 'Food',
        product_profile: 'general',
        cus_name: order.customer.name,
        cus_email: order.customer.email || 'customer@example.com',
        cus_add1: order.customer.address,
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: order.customer.phone,
        ship_name: order.customer.name,
        ship_add1: order.customer.address,
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };

    const sslcz = new SSLCommerzPayment(
      process.env.STORE_ID || "testbox",
      process.env.STORE_PASS || "qwerty",
      process.env.IS_LIVE === "true"
    );

    sslcz.init(data).then((sslResponse: any) => {
        // Redirect the user to payment gateway
        let GatewayPageURL = sslResponse.GatewayPageURL;
        res.status(201).json({
          success: true,
          message: "Order placed, redirecting to payment gateway...",
          data: {
            orderId: orderId,
            paymentUrl: GatewayPageURL
          }
        });
    }).catch((err: any) => {
      console.error("SSL Init Error:", err);
      apiResponse(res, 500, "Failed to initialize payment gateway");
    });
  } catch (error) {
    console.error("Error creating order:", error);
    apiResponse(res, 500, "Failed to create order");
  }
});

// ---------------------------------------------------------------------------
// Payment Callbacks
// ---------------------------------------------------------------------------
app.post("/api/payment/success", async (req: Request, res: Response) => {
  try {
    const ordersCollection = db.collection("orders");
    const tran_id = (req.query.tran_id || req.body.tran_id) as string;
    
    await ordersCollection.updateOne(
      { _id: new ObjectId(tran_id) },
      { $set: { status: "confirmed" } }
    );
    
    // Redirect to frontend success page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5001';
    res.redirect(`${frontendUrl}/order/${tran_id}?status=success`);
  } catch (error) {
    console.error("Success callback error:", error);
    res.status(500).send("Server Error");
  }
});

app.post("/api/payment/fail", async (req: Request, res: Response) => {
  try {
    const ordersCollection = db.collection("orders");
    const tran_id = (req.query.tran_id || req.body.tran_id) as string;
    
    await ordersCollection.updateOne(
      { _id: new ObjectId(tran_id) },
      { $set: { status: "cancelled" } }
    );
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5001';
    res.redirect(`${frontendUrl}/order/${tran_id}?status=fail`);
  } catch (error) {
    console.error("Fail callback error:", error);
    res.status(500).send("Server Error");
  }
});

app.post("/api/payment/cancel", async (req: Request, res: Response) => {
  try {
    const ordersCollection = db.collection("orders");
    const tran_id = (req.query.tran_id || req.body.tran_id) as string;
    
    await ordersCollection.updateOne(
      { _id: new ObjectId(tran_id) },
      { $set: { status: "cancelled" } }
    );
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5001';
    res.redirect(`${frontendUrl}/order/${tran_id}?status=cancel`);
  } catch (error) {
    console.error("Cancel callback error:", error);
    res.status(500).send("Server Error");
  }
});

app.get("/api/orders/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return apiResponse(res, 400, "Invalid order ID format");
    }

    const ordersCollection = db.collection("orders");
    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });

    if (!order) {
      return apiResponse(res, 404, "Order not found");
    }

    apiResponse(res, 200, "Order fetched successfully", order);
  } catch (error) {
    console.error("Error fetching order:", error);
    apiResponse(res, 500, "Failed to fetch order");
  }
});

app.get("/api/orders", verifyToken, async (req: Request, res: Response) => {
  try {
    const ordersCollection = db.collection("orders");
    const usersCollection = db.collection("users");
    const userId = (req as any).user.id;
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) return apiResponse(res, 404, "User not found");

    const query = user.role === "admin" 
        ? { vendorEmails: user.email } 
        : { "customer.email": user.email };
        
    const orders = await ordersCollection.find(query).sort({ createdAt: -1 }).toArray();
    apiResponse(res, 200, "Orders fetched successfully", orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    apiResponse(res, 500, "Failed to fetch orders");
  }
});

app.put("/api/orders/:id/status", verifyAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!isValidObjectId(id)) {
      return apiResponse(res, 400, "Invalid order ID format");
    }
    const ordersCollection = db.collection("orders");
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return apiResponse(res, 404, "Order not found");
    }
    apiResponse(res, 200, "Order status updated", result);
  } catch (error) {
    console.error("Error updating order status:", error);
    apiResponse(res, 500, "Failed to update order status");
  }
});

// ---------------------------------------------------------------------------
// Error handling middleware
// ---------------------------------------------------------------------------
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  apiResponse(res, 500, "Internal server error");
});

// 404 handler
app.use((_req: Request, res: Response) => {
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
