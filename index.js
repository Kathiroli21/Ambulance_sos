import app from './app.js';
import { initSocket } from './socket/index.js';
import http from 'http';
import connectDB from "./config/mongoDbConfig.js";
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
connectDB();


initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});