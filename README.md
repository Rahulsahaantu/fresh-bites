# 🍔 Fresh Bites — Modern Food Delivery & Multi-Vendor Platform

Fresh Bites is a full-stack food ordering and restaurant management platform built with Next.js, Express, MongoDB Atlas, and SSLCommerz payment integration.

---

## 🚀 Quick Start (Running from Scratch)

Follow these steps to run both the **Backend** and **Frontend** locally on your machine.

---

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (or `npm` / `yarn`)
- [Git](https://git-scm.com/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Rahulsahaantu/fresh-bites.git
cd fresh-bites
```

---

### Step 2: Set Up & Run the Backend

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or: npm install
   ```

3. **Create the environment file (`.env`):**
   Create a file named `.env` inside the `backend/` folder and add:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://freshbites_admin:ijEmVgA0VgE2P5sx@cuetdeliverydb.yk2ervd.mongodb.net/freshbites?retryWrites=true&w=majority&appName=cuetDeliveryDB
   FRONTEND_URL=http://localhost:5001
   JWT_SECRET=super_secret_fresh_bites_key_2026

   # SSL Commerz Sandbox Credentials
   STORE_ID=multi6945960959830
   STORE_PASS=multi6945960959830@ssl
   IS_LIVE=false
   ```

4. **(Optional) Seed initial food items & data:**
   ```bash
   pnpm run seed
   # or: npm run seed
   ```

5. **Start the backend server:**
   ```bash
   pnpm run dev
   # or: npm run dev
   ```
   *The backend will be running at `http://localhost:5000`.*

---

### Step 3: Set Up & Run the Frontend

Open a **new terminal tab or window**:

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or: npm install
   ```

3. **Create the local environment file (`.env.local`):**
   Create a file named `.env.local` inside the `frontend/` folder and add:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Start the frontend development server:**
   ```bash
   pnpm run dev
   # or: npm run dev
   ```
   *The frontend will run at `http://localhost:3000` (or `http://localhost:5001` if port 3000 is occupied).*

---

### Step 4: Open in Your Browser
- Visit: [http://localhost:5001](http://localhost:5001) (or `http://localhost:3000`)
- **Customer login / register**: Use any valid email or create a new customer account.
- **Admin registration**: Check "Register as Restaurant Admin" during sign up to manage food items, restaurant details, and incoming orders.

---

## 💳 Testing SSL Commerz Payments (Sandbox)

When placing an order:
1. Proceed through the checkout page and click **Place Order**.
2. You will be redirected to the SSL Commerz Sandbox portal.
3. Use the sandbox test card:
   - **Card Number**: `4111 1111 1111 1111`
   - **Expiry Date**: Any future date (e.g. `12/28`)
   - **CVV**: Any 3 digits (e.g. `123`)
4. Click Submit to verify the successful order confirmation callback.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Lucide React
- **Backend**: Express.js, TypeScript, MongoDB Atlas (`mongodb` driver)
- **Authentication**: JWT, bcryptjs
- **Payment Gateway**: SSLCommerz (`sslcommerz-lts`)
- **Deployment**: Vercel (Frontend), MongoDB Cloud (Database)
