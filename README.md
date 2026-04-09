# GeoVibe | Real-Time Tech Event Aggregator 🌍

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**GeoVibe** is a sophisticated Full-Stack MERN application designed to bridge the gap between developer communities and real-world tech opportunities. By leveraging real-time geospatial indexing and automated background synchronization, GeoVibe provides users with a live-map visualization of hackathons, workshops, and meetups happening in their region.

---

## 🌟 Key Features

### 🔍 Intelligence & Aggregation
- **Smart Data Crawling**: Automated background jobs (via `node-cron`) that interface with SerpApi (Google Events) and PredictHQ to ingest hundreds of live events daily.
- **Geospatial Discovery**: High-fidelity map integration using **Mapbox/Leaflet** and **2dsphere indexing** in MongoDB for high-performance proximity searches.
- **Custom Discovery Radius**: Users can define their search radius to find events specifically tailored to their location.

### ⚡ Real-Time Engagement
- **Live Notifications**: Integrated **Socket.io** layer that broadcasts newly discovered events to all active users without page refreshes.
- **Click Tracking Metrics**: Specialized recording of registration clicks to provide organizers with engagement data and ROI for their events.

### 👤 Organizer & User Experience
- **Host Dashboard**: A dedicated portal for organizers to manage their events, view engagement statistics, and reach their target audience.
- **Secure Authentication**: Robust session management using **JWT (JSON Web Tokens)** and bcrypt password hashing.
- **Responsive Aesthetics**: A premium dark-themed UI built with **React** and **Tailwind CSS**, optimized for both desktop and mobile discovery.

---

## 🏗️ Technical Architecture & Best Practices

As an engineer, I prioritized **scalability** and **clean code** in this project:

- **Modular Backend (MVC)**: Follows a strict Controller-Route-Service split to ensure business logic is decoupled from infrastructure.
- **Global Error Handling**: Centralized middleware layer to manage API errors gracefully, ensuring 100% server uptime even during external API failures.
- **Environment Driven**: 100% of sensitive data (API keys, DB URIs, Secrets) is managed via environment variables and protected by custom `.gitignore` rules.
- **Data Integrity**: Implemented automated "self-healing" diagnostic scripts to check database health and auto-seed fallback data when necessary.

---

## 🛠️ Technology Stack

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | React, Vite | Core view layer & high-performance build tool |
| **Styling** | Tailwind CSS | Utility-first styling for a premium UI |
| **Backend** | Node.js, Express | Scalable API & middleware management |
| **Real-time** | Socket.io | Bidirectional event broadcasting |
| **Database** | MongoDB | NoSQL storage with GeoJSON support |
| **Geospatial** | Leaflet / Mapbox | Map rendering & coordinate visualization |
| **DevOps** | Node-cron | Automated background task scheduling |

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18.0+)
- MongoDB (Running locally or via Atlas)
- Git

### Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/Karthikgowda-web/GeoVibe.git
   cd GeoVibe
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:5000
   SERPAPI_KEY=optional_key
   PREDICTHQ_API_KEY=optional_key
   ```

3. **Launch the Application**
   ```bash
   npm run dev
   ```

---

## 📐 Implementation Notes (Recruiter Insight)

During the development of GeoVibe, I encountered a challenge in standardizing coordinates from multiple external APIs. I solved this by implementing a **Geocoding Service** that uses a "Fast-Lookup" cache for major cities and falls back to a public Nominatim API when necessary, ensuring that every event has valid GPS coordinates for the map view.

---

## 🤝 Contact & Support

**Karthik Gowda**  
Full-Stack Developer  
[GitHub Profile](https://github.com/Karthikgowda-web)

Project Link: [https://github.com/Karthikgowda-web/GeoVibe](https://github.com/Karthikgowda-web/GeoVibe)
