import { spawn } from 'child_process';

const FRONTEND_PORTS = [8000, 8001, 8002]; // Publisher and Subscribers

console.log('Starting multiple instances of Lottong Pinoy SPA...');
console.log('SPA Server 1 - Port 8000: Publisher Server');
console.log('SPA Server 2 - Port 8001: Subscriber Server');
console.log('SPA Server 3 - Port 8002: Subscriber Server');
console.log('---');
console.log('API Server: Port 3000 - Backend API only (no Socket.IO)');
console.log('---');

FRONTEND_PORTS.forEach(port => {
  const env = { 
    ...process.env, 
    PORT: port.toString(),
    VITE_API_URL: 'http://localhost:3000/v1'
  };

  const server = spawn('node', ['server.js'], { 
    stdio: 'inherit', 
    shell: true,
    env
  });
  
  server.on('close', (code) => {
    console.log(`SPA server on port ${port} closed with code ${code}`);
  });
});

console.log('All frontend servers launched.');
console.log('You can access each instance at:');
console.log('- SPA Server 1 (Publisher): http://localhost:8000');
console.log('- SPA Server 2 (Subscriber): http://localhost:8001');
console.log('- SPA Server 3 (Subscriber): http://localhost:8002');
console.log('---');
console.log('All servers connect to API at http://localhost:3000/v1');
