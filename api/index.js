// Vercel Serverless Function wrapper
const app = require('../server');
const serverless = require('serverless-http');

// Export the serverless handler
module.exports = serverless(app);
