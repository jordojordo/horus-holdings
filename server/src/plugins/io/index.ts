import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

import { attachClientNamespace } from './clientNamespace';

let io: Server | null = null;

export function initIo(httpServer: HttpServer): Server {
  // Initialize socket.io server
  io = new Server(httpServer, {
    cors: { origin: '*' },
    path: '/ws'
  });

  // Create separate namespace
  const clientNs = io.of('/client');

  // Attach namespace event handlers
  attachClientNamespace(clientNs);

  return io;
}

export function getIoInstance(): Server {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initIo first.');
  }

  return io;
}
