import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import socketManager from './src/core/socket-server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = process.env.PORT || 3001;

const app = express();

app.use(express.static(join(__dirname, 'dist')));

app.get('/status', (req, res) => {
  const isPublisher = port === 3001;
  res.json({
    server: {
      port: port,
      role: isPublisher ? 'Publisher' : 'Subscriber',
      status: 'Running'
    },
    socketIO: {
      status: 'Active',
      connections: socketManager.clientSockets.length
    },
    apiURL: 'http://localhost:3000/v1'
  });
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '/', 'index.html'));
});

const server = createServer(app);

socketManager.init(server, parseInt(port));

server.listen(port, () => {
  console.log(`Frontend Server (${port === 3001 ? 'Publisher' : 'Subscriber'}) accessible at http://localhost:${port}`);
  console.log(`Connected to API at http://localhost:3000/v1`);
}); 