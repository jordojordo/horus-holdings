import rateLimit from 'express-rate-limit';

// Rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      process.env.NODE_ENV === 'development' ? 5000 : 10, // Limit each IP to 10 requests per windowMs
  message:  'Too many login attempts from this IP, please try again after 15 minutes'
});
