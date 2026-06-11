import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { initDb } from './server/db';
import { setupAuthRoutes } from './server/auth';
import { setupIncidentRoutes } from './server/incidents';

// Load environmental variables
dotenv.config();

async function startServer() {
  // Initialize database schema & seed values
  await initDb();

  const app = express();
  const PORT = 3000;

  // Increased body-parser limits for incident capture upload imagery (base64)
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));

  // API Status checks
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      service: 'Intelligent Community Emergency Response GIS Backend',
      timestamp: new Date().toISOString(),
    });
  });

  // Bind core functional routers
  setupAuthRoutes(app);
  setupIncidentRoutes(app);

  // Vite integration based on running environmental mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('Mounting dynamic Vite dev server compilation pipeline...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving production static build directory assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`==================================================================`);
    console.log(`  MUNICIPAL EMERGENCY PORTAL CORE SERVER RUNNING ON PORT ${PORT} `);
    console.log(`  Local Mode Portal Sandbox: http://localhost:${PORT}             `);
    console.log(`==================================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal incident booting full-stack community management system:', err);
});
