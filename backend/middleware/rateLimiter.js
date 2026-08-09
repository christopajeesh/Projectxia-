import rateLimit from 'express-rate-limit';

// Global API rate limiter - protects against bots and automated scrapers
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. ProjectXia Security Shield throttled access for 15 minutes.',
  },
});

// Sensitive Auth limiter - protects against brute-force password and OTP guessing
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // Limit each IP to 30 auth attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Anti-Brute Force Triggered: Too many login or OTP verification attempts. Please wait 10 minutes.',
  },
});

// AI scanner rate limiter - prevents spamming heavy model endpoints
export const aiScannerLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: 'AI Plagiarism & Scam Detector rate limit reached. Please throttle requests.',
  },
});
