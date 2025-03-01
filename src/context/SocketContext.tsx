import React, {
  createContext, useContext, useEffect, useRef, useCallback
} from 'react';
import { io, Socket } from 'socket.io-client';

import useAuthContext from '@/hooks/useAuth';

interface SocketContextValue {
  /**
   * Sends a message over a specified event (defaults to "message")
   */
  sendMessage: (message: any, event?: string) => void;
  /**
   * Sets a handler for a given event
   */
  setOnMessage: (event: string, handler: (data: any) => void) => void;
}

const CLIENT_NAMESPACE = '/client';

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

const SocketProvider: React.FC<{ url: string; path: string; children: React.ReactNode }> = ({ url, path, children }) => {
  const socketRef = useRef<Socket | null>(null);
  const { isLoading, authenticated } = useAuthContext();

  const establishConnection = useCallback(() => {
    if (!socketRef.current) {
      console.log(`[Socket] Establishing Socket.IO connection with: ${ url }${ path }${ CLIENT_NAMESPACE }`);
      socketRef.current = io(url + CLIENT_NAMESPACE, {
        path,
        transports: ['websocket']
      });


      socketRef.current.on('connect', () => {
        console.log('[Socket] Socket.IO connection established');
      });

      socketRef.current.on('disconnect', (reason: string) => {
        console.log(`[Socket] Socket.IO disconnected: ${ reason }`);
      });

      socketRef.current.on('connect_error', (error: any) => {
        console.error('[Socket] Socket.IO connection error:', error);
      });

      // Example: handle a token expiration event (similar to your Vue service)
      socketRef.current.on('token_expired', () => {
        console.log('[Socket] Token expired event received');
        // Add your token expiration handling logic here
      });
    }
  }, [url]);

  // Establish or disconnect the socket based on the user's authentication state
  useEffect(() => {
    if (!isLoading && authenticated) {
      console.log('[Socket] User is authenticated, establishing Socket.IO connection...');
      establishConnection();
    } else if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, [isLoading, authenticated, establishConnection]);

  // Clean up on page unload or component unmount
  useEffect(() => {
    const handleUnload = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Send a message on a given event (defaulting to "message")
  const sendMessage = (message: any, event: string = 'message') => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, message);
    }
  };

  // Set (or replace) an event handler for a specified event
  const setOnMessage = (event: string, handler: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event);
      socketRef.current.on(event, handler);
    }
  };

  return (
    <SocketContext.Provider value={{
      sendMessage,
      setOnMessage
    }}>
      {children}
    </SocketContext.Provider>
  );
};

const useSocketContext = () => {
  const context = useContext(SocketContext);

  if (context === undefined) {
    throw new Error('[Socket] useSocketContext must be used within a SocketProvider');
  }

  return context;
};

export { SocketProvider, useSocketContext };
