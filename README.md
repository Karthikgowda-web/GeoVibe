# GeoVibe 🌍

GeoVibe is a high-fidelity MERN (MongoDB, Express, React, Node.js) application designed for real-time tech event aggregation and community discovery. It features a beautiful dark-mode dashboard, live map integration, and automated event syncing from multiple public APIs.

## 🚀 Features

- **Dynamic Event Discovery**: Visualize tech events, hackathons, and meetups on an interactive map.
- **Smart Aggregation**: Automated background syncing with SerpApi, PredictHQ, and other tech event sources.
- **Real-time Updates**: Socket.io integration for instant notification of new events.
- **Organizer Portal**: Dedicated space for hosts to create, manage, and track engagement for their events.
- **Location-based Search**: Find events near you with custom discovery radii.

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, Mapbox/Leaflet.
- **Backend**: Node.js, Express, Socket.io, Mongoose.
- **Database**: MongoDB (with 2dsphere indexing for GeoJSON support).
- **Scheduling**: Node-cron for automated synchronization tasks.

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Running locally or on Atlas)
- API Keys: SerpApi, PredictHQ (optional but recommended for live data)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd GeoVibe
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file with your MONGO_URI, JWT_SECRET, and API keys
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   ```

4. **Run the Application**:
   From the root directory:
   ```bash
   npm run dev
   ```

## 🔒 Security

This repository uses a `.gitignore` to protect sensitive data. Never commit your `.env` files.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
