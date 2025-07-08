import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';
import { initializeDatabase } from '../server/setup';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS headers for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Telegram-Id');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

let isInitialized = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize database only once
  if (!isInitialized) {
    await initializeDatabase();
    isInitialized = true;
  }
  
  // Register routes
  await registerRoutes(app);
  
  // Handle the request
  return app(req, res);
}