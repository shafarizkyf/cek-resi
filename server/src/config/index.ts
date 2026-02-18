export const config = {
  port: process.env.PORT || 3001,
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '30', 10),
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'cek_resi',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
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
