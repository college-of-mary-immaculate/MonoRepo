import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config.js';
import path from 'path';
import { fileURLToPath } from 'url';

import v1 from './routes/v1/index.js';
import './core/database.js';
import morgan from 'morgan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/v1', cors(), v1);

app.get('/debug/api-info', (req, res) => {
  res.json({
    server: {
      port: port,
      type: 'API Server'
    },
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});