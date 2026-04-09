const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cron = require('node-cron');

const eventScraperJob = require('./services/eventScraper');
const syncExternalEvents = require('./services/externalSync');
const fetchExternalEvents = require('./services/eventFetcher');
const syncGlobalDevEvents = require('./services/syncEngine');
const syncLiveEventsFromAPI = require('./services/eventSync');
const syncEventAggregator = require('./services/eventAggregator');

const errorMiddleware = require('./middleware/errorMiddleware');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ status: "success", message: "GeoVibe Backend Local API is active and running perfectly!" });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';

console.log(`[DB] Attempting to connect to: ${MONGO_URI}`);
mongoose.connection.on('error', err => console.error('[DB] Runtime connection error:', err.message));
mongoose.connection.on('disconnected', () => console.warn('[DB] Lost connection to MongoDB.'));

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[DB] Connection established successfully.');

    server.listen(PORT, () => {
       console.log(`[SERVER] Active on port ${PORT}`);
       
              eventScraperJob();

              cron.schedule('0 0 * * *', () => syncExternalEvents());
       cron.schedule('0 */6 * * *', () => fetchExternalEvents());
       cron.schedule('0 8 * * *', () => syncGlobalDevEvents());
       cron.schedule('0 */12 * * *', () => syncLiveEventsFromAPI());
       cron.schedule('0 */12 * * *', () => syncEventAggregator());
    });
  } catch (err) {
    console.error('========================================');
    console.error('[CRITICAL] Database handshake failed!');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    if (err.name === 'MongooseServerSelectionError') {
      console.error('TIP: This usually means your IP is not whitelisted in MongoDB Atlas.');
    }
    console.error('========================================');
    process.exit(1);
  }
};

startServer();

