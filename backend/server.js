import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const helmet = require('helmet');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');

const productRoutes = require('./src/routes/products');
const bomRoutes = require('./src/routes/boms');
const stockRoutes = require('./src/routes/stock');
const importRoutes = require('./src/routes/import');

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

app.use('/api/products', productRoutes);
app.use('/api/boms', bomRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/import', importRoutes);

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

module.exports = app;