import { Namespace } from 'socket.io';
import logger from '@server/config/logger';

const connectedClients: string[] = [];
let clientNsRef: Namespace | null = null;

/**
 * Attaches all event handlers for the "/client" namespace.
 * @param clientNs
 */
export function attachClientNamespace(clientNs: Namespace) {
  clientNsRef = clientNs;

  clientNs.on('connection', (socket) => {
    logger.info(`[Client NS] UI client connected: ${ socket.id }`);
    connectedClients.push(socket.id);

    socket.on('disconnect', () => {
      const index = connectedClients.indexOf(socket.id);

      if (index !== -1) {
        connectedClients.splice(index, 1);
        logger.info(`[Client NS] UI client disconnected: ${ socket.id }`);
      }
    });
  });
}

/**
 * Emit an event to all connected clients.
 * @param event
 * @param payload
 */
export function broadcast(event: string, payload: unknown) {
  connectedClients.forEach((socketId) => {
    clientNsRef?.to(socketId).emit(event, payload);
  });
}
