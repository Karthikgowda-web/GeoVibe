# GeoVibe: Production-Grade Hyper-Local Event Aggregator

GeoVibe is a high-fidelity MERN ecosystem designed for hyper-local opportunity discovery in Bengaluru. It features a stateless backend, geospatial intelligence, and a resilient media pipeline using MongoDB GridFS.

![GeoVibe Dashboard](https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80) 

---

## 🚀 Key Engineering Highlights

### 1. Stateless Architecture & GridFS Pipeline
Unlike traditional local file-system storage which is ephemeral on cloud platforms like Render, GeoVibe implements **MongoDB GridFS**. 
- **Binary Chunking**: Large media assets are split into 255KB chunks and stored natively in MongoDB.
- **Cache-Busting Streams**: Implemented version-tracked binary streaming (`?v=t`) to ensure real-time reflection of media updates while bypassing stale browser caches.

### 2. Geospatial Intelligence
- **2dsphere Indexing**: Optimized MongoDB search performance using spatial math (Haversine formula logic) via a `2dsphere` index on the location field.
- **Interactive Proximity Queries**: Supports dynamic radius scaling (15km to 100km) with sub-millisecond query performance for concurrent users.

### 3. Resilient Multi-Source Aggregation
- **Unified Schema Normalization**: Aggregates data from NewsAPI, Meetup, and internal community hosts into a single, standardized JSON feed.
- **Adaptive UI Rendering**: The frontend dynamically toggles UI components (e.g., 'Team Size', 'Register') based on content category (News vs. Event).

### 4. Production Stability
- **Singleton Connection Pattern**: Prevents database connection pool exhaustion under high concurrency.
- **Debounced Interactions**: Search and Map queries are throttled to reduce unnecessary API pressure.

---

## 🛠️ Technology Stack
- **Frontend**: React.js, Tailwind CSS, Lucide Icons, Leaflet (Maps).
- **Backend**: Node.js, Express.js, Mongoose.
- **Database**: MongoDB Atlas (GridFS for media binary large objects).
- **Security**: CORS Whitelisting, Helmet, Rate Limiting.

---

## 📦 Installation & Setup

1. **Clone & Install**:
   ```bash
   git clone https://github.com/Karthikgowda-web/GeoVibe.git
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secure_secret
   VITE_API_URL=http://localhost:5000
   ```

3. **Run in Development**:
   ```bash
   npm run dev
   ```

---

## 📈 System Design Philosophy
GeoVibe was built with **Statelessness** as a core pillar. By decoupling media storage from the local filesystem and moving it to a database-native solution (GridFS), the application can be scaled horizontally across multiple cloud nodes without data loss.

---

**Developed for Professional Technical Placement Portfolio**
*Focusing on Backend scalability, Geospatial performance, and Dynamic UI/UX.*
