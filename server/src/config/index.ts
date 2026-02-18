export const config = {
  port: process.env.PORT || 3001,
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min default
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '30', 10),
  },
  binderbyte: {
    apiUrl: process.env.BINDERBYTE_API_URL || 'https://api.binderbyte.com',
    apiKey: process.env.BINDERBYTE_API_KEY || '',
  },
  biteship: {
    apiUrl: process.env.BITESHIP_API_URL || 'https://api.biteship.com',
    apiKey: process.env.BITESHIP_API_KEY || '',
  },
  providers: {
    default: process.env.DEFAULT_PROVIDER || 'binderbyte',
    fallback: process.env.FALLBACK_PROVIDER || 'biteship',
  },
};
