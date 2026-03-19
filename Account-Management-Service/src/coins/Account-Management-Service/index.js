import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './configs/db.js';
import accountsRoutes from './src/accounts/accounts.routes.js';
import accountLockRoutes from './src/accountLock/accountLock.routes.js';

const app = express();
const PORT = process.env.PORT || 3007;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'Account Management' });
});

connectDB();

app.use('/api/accounts', accountsRoutes);
app.use('/api/accountLock', accountLockRoutes);

app.listen(PORT, () => {
  console.log(`Account Management Service running on port ${PORT}`);
});