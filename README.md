# Lufyco Clothing Application

> A full-stack AI-powered clothing e-commerce mobile application built with **React Native (Expo)** for the frontend and **Node.js / Express / MongoDB** for the backend.

---

## 👤 Developer Info

| Field         | Value                  |
|---------------|------------------------|
| **Name**      | Nihinsa Bandara        |
| **Project**   | Lufyco Clothing App    |

---

## 📁 Project Structure

```
Lufyco_Clothing/
├── Lufyco_Backend/      # Node.js + Express REST API + ML services
├── Lufyco_Frontend/     # Expo / React Native mobile app
├── Documents/           # Project proposals, architecture docs & handouts
└── datasets/            # Product & ML training datasets
```

---

## ✨ Features

### 🔐 Authentication & Security
- Email/password signup with **OTP email verification** (6-digit, 10-min expiry)
- Supported email providers: Gmail, Yahoo, Outlook/Hotmail, iCloud, ProtonMail, AOL, Mail.com, Zoho
- **Forgot password** flow with email OTP reset
- **Change password** from within profile
- JWT-based session management (via Zustand `useAuthStore`)
- Intro / Splash screen onboarding

### 🏠 Home & Discovery
- **Home Screen** – Featured banner carousel (auto-scroll with pagination dots), category rows, latest products grid
- **Search Overlay** – Real-time product search with image search (camera icon)
- **Categories Screen** – Browse all categories in a scrollable grid
- **Offers/Sale Screen** – Active promotions and discounts
- **Upcoming Events Screen** – Fashion events and sale calendars
- **Notifications Screen** – In-app notification centre with dark theme support

### 👗 Shopping
- **Product Listing Screen** – Paginated product grid with filters
- **Filter Sheet** – Filter by size, color, price range, and category
- **Product Details Screen** – Full-screen product view with size picker, color selection, image gallery, and reviews
- **Men's Wear / Women's Wear** screens with dedicated category browsing
- **Shop New Styles** curated collection screen
- **Category Products Screen** – Auto-filtered by selected category, header shows category name

### 🛒 Cart & Checkout
| Screen | Description |
|---|---|
| `MyCartScreen` | View cart, update quantities, remove items |
| `CheckoutShippingScreen` | Enter / select delivery address |
| `CheckoutPaymentScreen` | Choose payment method (card, wallet, COD) with custom payment icons |
| `CheckoutReviewScreen` | Review order before placing |
| `OrderSuccessScreen` | Confirmation page after successful order |

### 📦 Orders & Tracking
- **Order History Screen** – View all past orders with status badges
- **Order Details Screen** – Detailed order info with a **visual tracking progress bar** (Confirmed → Packed → Shipped → Out for Delivery → Delivered)
- **Track Order Screen** – Live order tracking

### ❤️ Wishlist
- **Wishlist Screen** – Saved favourite products with full dark theme support
- Add-to-cart directly from wishlist, with automatic cart navigation

### 🤖 AI Stylist Features
| Feature | Description |
|---|---|
| **AI Stylist Screen** | Get AI-powered outfit recommendations based on preferences |
| **Image Search Screen** | Upload a photo to find visually similar products (ML feature extraction) |
| **Plan My Look Screen** | Plan an outfit based on weather, occasion, and wardrobe |
| **Suggested Outfit Screen** | View AI-suggested complete looks with undo/redo and save functionality |

### 👔 My Closet
- **My Closet Screen** – Manage your personal virtual wardrobe
- **Add to Closet Screen** – Add new items to your closet
- **Add to Closet Preview Screen** – Preview item before saving

### 👤 Profile & Settings
- **Profile Screen** – View and edit profile with **profile picture upload** (Cloudinary-backed)
- **Payments Screen** – Manage saved payment methods with custom icons
- Profile sub-screens for editing personal info

### 🌙 Dark Mode
Full dark theme support across **all** screens — Home, Cart, Wishlist, AI Stylist, Notifications, Profile, and more. All text colors dynamically adapt to the active theme for maximum readability.

---

## 🧰 Tech Stack

### Backend (Node.js)

| Package | Version |
|---|---|
| express | ^5.2.1 |
| mongoose | ^9.1.3 |
| @tensorflow/tfjs | ^4.22.0 |
| cloudinary | ^2.9.0 |
| multer | ^2.0.2 |
| nodemailer | ^7.0.13 |
| sharp | ^0.34.5 |
| axios | ^1.13.5 |
| cors | ^2.8.5 |
| dotenv | ^17.2.3 |
| validator | ^13.15.26 |

**Dev Dependencies:** `nodemon ^3.1.11`

**Backend Services:**
- `imageService.js` – Cloudinary image upload & management
- `mlFeatureExtractor.js` – TensorFlow.js ML feature extraction for image search
- `outfitService.js` – AI outfit generation logic

**API Routes:**
- `/api/users` – Auth, profile, password management
- `/api/products` – Product listing, filtering, search
- `/api/orders` – Order creation & tracking
- `/api/wishlist` – Wishlist CRUD
- `/api/closet` – Virtual closet management
- `/api/ai` – AI stylist & outfit recommendation endpoints

### Python (ML Model Training)

| Package | Version |
|---|---|
| tensorflow-gpu | >=2.13.0 |
| tensorflowjs | >=4.0.0 |
| numpy | >=1.24.0 |
| Pillow | >=10.0.0 |
| matplotlib | >=3.7.0 |

### Frontend (Expo / React Native)

| Package | Version |
|---|---|
| expo | ^52.0.47 |
| react-native | 0.76.7 |
| react | 18.3.1 |
| @react-navigation/native | ^7.0.14 |
| @react-navigation/bottom-tabs | ^7.2.0 |
| @react-navigation/stack | ^7.1.1 |
| zustand | ^5.0.10 |
| axios | ^1.7.9 |
| expo-image-picker | ~16.0.6 |
| expo-location | ~18.0.10 |
| expo-notifications | ^0.32.16 |
| expo-blur | ~14.0.3 |
| expo-haptics | ~14.0.1 |
| react-native-reanimated | ~3.16.1 |
| react-native-gesture-handler | ~2.20.2 |
| react-native-screens | ~4.4.0 |
| react-native-safe-area-context | ^4.12.0 |
| react-native-pager-view | ^6.7.0 |
| react-native-ui-datepicker | ^3.1.2 |
| react-native-webview | 13.12.5 |
| dayjs | ^1.11.18 |
| @expo/vector-icons | ^14.0.2 |

**State Management (Zustand Stores):**
- `useAuthStore` – Authentication & user session
- `useCartStore` – Shopping cart state
- `useCheckoutStore` – Checkout flow state
- `useOrdersStore` – Order history
- `useProductsStore` – Product catalog
- `useProfileStore` – User profile data
- `useShopStore` – Shop filters & browsing state
- `useWishlistStore` – Wishlist items

**Dev Dependencies:** TypeScript `^5.3.3`, Jest, Babel

---

## ✅ Prerequisites

Before running the application, ensure you have:

1. **Node.js** (LTS recommended): [Download](https://nodejs.org/)
2. **Git**: [Download](https://git-scm.com/)
3. **MongoDB**: Local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string
4. **Expo Go** app on your Android/iOS device (for mobile testing)

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Lufyco_Clothing
```

### 2. Backend Setup

```bash
cd Lufyco_Backend
npm install
```

Create a `.env` file in `Lufyco_Backend/`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5001
JWT_SECRET=your_jwt_secret

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (OTP verification)
# For Gmail: enable 2FA and create an App Password at https://myaccount.google.com/apppasswords
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-specific-password
```

Start the backend:

```bash
npm run dev
```

> The server runs on `http://localhost:5001` by default. 
> **Important**: Ensure the backend is running *before* starting the frontend to avoid "Network Error" issues.

### 3. Frontend Setup

```bash
cd Lufyco_Frontend
npm install
npx expo start
```

- Press **`w`** to open in browser
- Press **`a`** for Android emulator
- Press **`i`** for iOS Simulator (macOS + Xcode required)
- Scan the **QR code** with **Expo Go** on your phone

---

## 🚀 Running the Application

### Windows

```powershell
# Terminal 1 – Backend (Local Development)
cd Lufyco_Backend
npm install   # First time only
npm run dev

# Terminal 2 – Frontend (Local Development)
cd Lufyco_Frontend
npm install   # First time only
npx expo start
```

### macOS / Linux

```bash
# Terminal 1 – Backend (Local Development)
cd Lufyco_Backend && npm install && npm run dev

# Terminal 2 – Frontend (Local Development)
cd Lufyco_Frontend && npm install && npx expo start
```

### 🌍 Running on Physical Devices (External Networks)

If you want to test the app on a physical device that is **not** on the same Wi-Fi network as your computer, you need to expose both the backend and frontend to the internet.

**Step 1. Expose the Backend**
1. Keep your Node.js backend running in Terminal 1.
2. Open a new terminal and run Localtunnel to expose port 5001:
   ```bash
   npx localtunnel --port 5001
   ```
3. Copy the generated URL (e.g., `https://some-url.loca.lt`) and update `API_URL` in `Lufyco_Frontend/app/api/api.js`.

**Step 2. Expose the Frontend (Expo)**
1. Open a new terminal and start Expo with the `--tunnel` flag:
   ```bash
   cd Lufyco_Frontend
   npx expo start --tunnel
   ```
2. Scan the provided QR code using the **Expo Go** app on your phone.

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| MongoDB connection error | Whitelist your IP in Atlas or ensure local MongoDB is running. Check `MONGO_URI` in `.env`. |
| Login "Network Error" | 1. Ensure the backend is running (`npm run dev`). <br> 2. Confirm your device/emulator is on the **same Wi-Fi** as your computer. <br> 3. Check Windows Firewall (ensure port 5001 is open). |
| Missing modules | Delete `node_modules` and `package-lock.json`, then re-run `npm install`. |
| Port conflict | Change `PORT` in `.env` (backend) or use `--port` flag for Expo. |
| Email not sending | Confirm `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`; use an **App Password** (not your regular Gmail password). Restart server after editing `.env`. |
| OTP not received | Check spam/junk folder. OTPs expire after **10 minutes** – request a new one if needed. |
| Cloudinary upload fails | Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are correctly set. |
| Image search not working | Ensure the TensorFlow.js ML model is loaded in the backend. Check `mlFeatureExtractor.js` logs. |
| Dark mode text unreadable | Ensure all text components use `colors.text` from `ThemeContext` instead of hardcoded color values. |

---

## 🕘 Recent Updates (March 2026)

- 🤖 **Dynamic API Selection** – The app now automatically detects the computer's IP address (via `expo-constants`) ensuring seamless connectivity for both iOS simulators (iMac) and Android emulators without manual IP configuration.
- 🎨 **Dark Mode Text Fix** – All screen text now dynamically uses theme colors (`colors.text`, `colors.textSecondary`) ensuring readability in both light and dark mode
- 📐 **Home Screen Spacing** – Increased gap between categories, banner carousel, and product sections for a more breathable layout
- 🧹 **Codebase Cleanup** – Removed unused images, dependencies, and redundant code
- 🏷️ **Category Products** – Category screen now resets filters correctly and displays the right category name in the header
- 🛒 **Wishlist Cart** – "Add to Cart" from Wishlist now correctly adds items and navigates to cart
- 🖼️ **Profile Picture** – Profile picture upload with Cloudinary persistence and graceful error handling for storage limits
- 📊 **Order Tracking Bar** – Visual step-by-step progress bar added to Order Details screen

---

## 🤖 AI Architecture — How It Actually Works

All AI features in this project are **fully on-demand**. Nothing runs in the background or on a schedule — all processing is triggered only when the user takes an explicit action.

| AI Feature | Runs in Background? | When It Runs | How |
|---|---|---|---|
| **TF.js Image Search Model** | ❌ No | Only when user uploads a photo | Model lazy-loads into memory on first request, then stays resident for the lifetime of the server |
| **Outfit Recommendation** | ❌ No | Only when user taps "Generate Outfit" | Rule-based logic (occasion + weather filters + random product selection from MongoDB) |
| **Saved Looks CRUD** | ❌ No | Only on user action (save/delete/view) | Standard MongoDB read/write via REST API |

### 🔁 Image Search Flow
```
User uploads photo → Multer stores in memory → TF.js extracts feature vector
→ Cosine similarity compared against all products → Top 10 results returned
→ Fallback: random results if no product feature vectors exist
```

### 👗 Outfit Generation Flow
```
User selects occasion + weather → Backend filters products from MongoDB
→ Categorizes into tops/bottoms/shoes/outerwear → Assembles outfit randomly
→ Suggests accessories → Returns complete outfit JSON
```

---

## 🛠️ How I Developed This

### Phase 1 — Planning & Design
- Defined the full feature set: authentication, shopping, AI stylist, closet management, dark mode
- Designed screen wireframes and navigation flow (bottom tabs + stack navigator)
- Chose tech stack: **Expo/React Native** (frontend), **Node.js + Express + MongoDB** (backend), **Zustand** (state management)

### Phase 2 — Backend First
- Set up **Express REST API** with modular routes and controllers
- Implemented **JWT authentication** with email OTP verification using Nodemailer
- Integrated **Cloudinary** for image uploads (product images, profile pictures)
- Built product, order, wishlist, and closet APIs with MongoDB/Mongoose

### Phase 3 — Frontend Screens
- Built all screens screen-by-screen, starting with auth flow (login → OTP → home)
- Used **Zustand stores** for global state (cart, wishlist, auth, orders, shop filters)
- Implemented **React Navigation** with nested stack + bottom tab navigators
- Created reusable components: product cards, filter sheets, image galleries

### Phase 4 — AI & ML Features
- Integrated **TF.js** in the backend for image feature extraction (MobileNet v2)
- Built `mlFeatureExtractor.js` with cosine similarity for visual product search
- Implemented rule-based outfit generator in `outfitService.js` (weather + occasion logic)
- Built **Plan My Look** screen with weather API integration and AI outfit suggestions
- Added **Suggested Outfit** screen with undo/redo stack and save-to-looks feature

### Phase 5 — UI / UX Polish
- Implemented full **dark mode** using React Context (`ThemeContext`) — all text/backgrounds adapt dynamically
- Added **banner carousel** with auto-scroll and pagination dots
- Improved **spacing and layout** throughout the Home screen for a premium feel
- Added visual **order tracking progress bar** on the Order Details screen
- Replaced default icons with custom payment method images

### Phase 6 — Testing & Bug Fixes
- Fixed category products screen filter reset and header label
- Fixed Wishlist "Add to Cart" functionality and cart navigation
- Resolved profile picture storage limit handling (Cloudinary quota errors)
- Fixed all hardcoded text colors that were unreadable in dark mode
- Cleaned up unused images, dependencies, and redundant code

---

## 📄 License

This project is proprietary. All rights reserved © Nihinsa Bandara / Lufyco.
