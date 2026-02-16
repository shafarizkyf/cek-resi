export const config = {
  port: process.env.PORT || 3001,
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
