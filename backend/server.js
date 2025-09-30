import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import logger from './src/utils/logger.js';
import errorHandler from './src/middleware/errorHandler.js';

import resetRoutes from './src/routes/reset.js';
import importRoutes from './src/routes/import.js';
import stockRoutes from './src/routes/stock.js';
import manufacturingRoutes from './src/routes/manufacturing.js';
import bomsRoutes from './src/routes/boms.js';
import productsRoutes from './src/routes/products.js';
import warehouseRoutes from './src/routes/warehouse.js';
import statistiqueRoutes from './src/routes/statistique.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.use('/api/statistique', statistiqueRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/reset', resetRoutes);
app.use('/api/import', importRoutes);
app.use('/api/boms', bomsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/manufacturing', manufacturingRoutes);
app.use('/api/stock', stockRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 Backend server running on port ${PORT}`);
  logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  logger.info(`🔗 Dolibarr API: ${process.env.DOLIBARR_API_URL}`);
});

export default app;
