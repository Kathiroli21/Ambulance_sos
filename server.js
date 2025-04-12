import app from './app.js';
import { initSocket } from './socket/index.js';
import http from 'http';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});