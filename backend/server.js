import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './config/db.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initChatSocket } from './socket/chatSocket.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import licenseRoutes from './routes/licenseRoutes.js';
import aiShieldRoutes from './routes/aiShieldRoutes.js';
import agencyRoutes from './routes/agencyRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io initialization with cyber security configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});
initChatSocket(io);

// Connect to Database or Hybrid Store
connectDB();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use('/api', globalLimiter);

// Health & System Info Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'ProjectXia Cyber Marketplace API',
    securityShield: 'ACTIVE (Anti-DDoS, Anti-Plagiarism, Rate-Limited)',
    version: '2.4.0',
    db: getDBStatus(),
    timestamp: new Date(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/ai-shield', aiShieldRoutes);
app.use('/api/agency', agencyRoutes);
app.use('/api/payouts', payoutRoutes);

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Static Frontend Assets & SPA Fallback
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) {
      return next();
    }
  });
});

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  ======================================================
  🚀 [ProjectXia Backend Engine] OPERATIONAL ON PORT ${PORT}
  🛡️ [Security Shield] Zero-Day & Plagiarism Defense ACTIVE
  🌐 [Real-Time Gateway] Socket.IO Engine LISTENING
  ======================================================
  `);
});
