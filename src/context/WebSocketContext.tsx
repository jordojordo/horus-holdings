import React, {
  createContext, useContext, useEffect, useRef, useCallback, useState
} from 'react';
import useAuthContext from '../hooks/useAuth';

interface WebSocketContextValue {
  sendMessage: (message: any) => void;
  setOnMessage: (handler: (event: MessageEvent) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

const WebSocketProvider: React.FC<{ url: string, children: React.ReactNode }> = ({ url, children }) => {
  const socketRef = useRef<WebSocket | null>(null);
  const { user } = useAuthContext();
  const [onMessageHandler, setOnMessageHandler] = useState<(event: MessageEvent) => void>(() => () => {});

  const establishConnection = useCallback(() => {
    if (!socketRef.current) {
      console.log('Establishing WebSocket connection...');
      socketRef.current = new WebSocket(url);
    }

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    socketRef.current.onmessage = (event: MessageEvent) => {
      if (onMessageHandler) {
        onMessageHandler(event);
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socketRef.current.onclose = (event) => {
      console.log(`WebSocket connection closed: Code=${ event.code }, Reason=${ event.reason }, Clean=${ event.wasClean }`);

      if (!event.wasClean) {
        console.log('WebSocket connection closed abnormally, retrying...');
        setTimeout(establishConnection, 5000);
      }
    };
  }, [url, onMessageHandler]);

  useEffect(() => {
    if (user) {
      establishConnection();
    } else if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, [user, establishConnection]);

  useEffect(() => {
    const handleUnload = () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);

      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendMessage = (message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };


  const setOnMessage = (handler: (event: MessageEvent) => void) => {
    setOnMessageHandler(() => handler);
  };

  return (
    <WebSocketContext.Provider value={{
      sendMessage,
      setOnMessage
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);

  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }

  return context;
};

export { WebSocketProvider, useWebSocketContext };
