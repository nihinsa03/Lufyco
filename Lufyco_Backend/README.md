# Lufyco_Clothing - Backend

My Final Year Project

> **NOTE**: The frontend app depends on this backend. Always start the backend first using `npm run dev` before launching the mobile app to avoid connection errors.

## Prerequisites
- [Node.js](https://nodejs.org/) (Maintained version recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

## Installation & Setup

> **IMPORTANT**: If you are moving this project between operating systems (e.g., Mac to Windows), you **MUST** delete the `node_modules` folder and `package-lock.json` file before installing dependencies.

### Windows (PowerShell)
1. Navigate to the backend directory:
   ```powershell
   cd Lufyco_Backend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Set up your `.env` file (ensure `MONGO_URI` is correct).

### Mac OS / Linux (Terminal)
1. Navigate to the backend directory:
   ```bash
   cd Lufyco_Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
   *(If you encounter permission errors, use `sudo npm install`, though using a version manager like `nvm` is preferred)*

## Running the Server

### Development Mode
Runs the server with `nodemon` for hot-reloading.
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Seed Sample Data

Before using the app, you need to populate the database with sample data.

### Seed Products (Clothing Catalog)
Inserts ~30 sample clothing products (Men, Women, Kids, Shoes, Accessories):
```bash
node seed_products_v2.js
```

### Seed Closet Items (My Closet)
Inserts 10 sample closet items across all categories:
```bash
node seed_closet.js
```

> **Note:** These scripts will connect to MongoDB using the `MONGO_URI` in your `.env` file. Make sure the connection string is correct before running.

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (supports `?gender=`, `?category=`, `?search=` filters) |
| POST | `/api/products` | Create a new product |

### Closet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/closet` | Get all closet items (supports `?category=`, `?search=` filters) |
| POST | `/api/closet` | Add item to closet |
| DELETE | `/api/closet/:id` | Permanently delete a closet item |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login |
| POST | `/api/users/verify-email` | Verify email with OTP |
| POST | `/api/users/forgot-password` | Request password reset |
| POST | `/api/users/reset-password` | Reset password |
