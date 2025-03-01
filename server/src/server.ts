import { createServer } from 'http';

import app from '@server/plugins/app';
import { initIo } from '@server/plugins/io';
import logger from '@server/config/logger';

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Initialize Socket.IO
initIo(httpServer);

// Start the HTTP server
httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${ PORT }`);
});
