const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');

const app = express();
const server = http.createServer(app);

// Initialize Database connection (Singleton)
require('./config/db');

const eventScraperJob = require('./services/eventScraper');
const syncExternalEvents = require('./services/externalSync');
const fetchExternalEvents = require('./services/eventFetcher');
const syncGlobalDevEvents = require('./services/syncEngine');
const syncLiveEventsFromAPI = require('./services/eventSync');
const syncEventAggregator = require('./services/eventAggregator');
const syncNews = require('./services/newsService');
const syncMeetups = require('./services/meetupService');
const syncCultural = require('./services/culturalService');

const errorMiddleware = require('./middleware/errorMiddleware');

// ─────────────────────────────────────────────────────────────────────────────
// ENTERPRISE MIDDLEWARES
// ─────────────────────────────────────────────────────────────────────────────

// Security Headers (Helmet) - Protects against well-known web vulnerabilities
app.use(helmet());

// Response Compression - Gzip compresses all responses for better performance
app.use(compression());

// Rate Limiting - Prevents DDoS/Brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api/', limiter);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://geo-vibe-nine.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o)) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

const io = new Server(server, { 
  cors: corsOptions
});
app.set('io', io);

app.use(cors(corsOptions));
app.use(express.json());
// GridFS is now used for all image storage. Local /uploads folder is deprecated.

app.get('/', (req, res) => {
  res.json({ status: "success", message: "GeoVibe Backend Enterprise API is active and running perfectly!" });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));

// Global Error Handler (Last stage)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

/**
 * Starts the Express server and schedules background jobs.
 * This function waits for the environment variables to load and 
 * initializes all periodic synchronization engines.
 * @async
 * @function startServer
 * @returns {void}
 */
const startServer = () => {
    server.listen(PORT, () => {
       console.log(`[SERVER] Enterprise Shield Active on port ${PORT}`);
       
       // Initial Scraper Run
       eventScraperJob();

       // Schedule Background Synchronization
       cron.schedule('0 0 * * *', () => syncExternalEvents());
       cron.schedule('0 */6 * * *', () => fetchExternalEvents());
       cron.schedule('0 8 * * *', () => syncGlobalDevEvents());
       cron.schedule('0 */12 * * *', () => syncLiveEventsFromAPI());
       cron.schedule('0 */12 * * *', () => syncEventAggregator());
       cron.schedule('0 */4 * * *', () => syncNews());
       cron.schedule('0 */8 * * *', () => syncMeetups());
       cron.schedule('0 */12 * * *', () => syncCultural());
       
       // Immediate initial run on startup for dev visibility
       syncNews();
       syncMeetups();
       syncCultural();
    });
};

startServer();

