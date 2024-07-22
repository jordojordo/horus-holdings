import { useEffect, useRef } from 'react';

const useWebSocket = (url: string, onMessage: () => void) => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const establishConnection = () => {
      if ( socketRef.current ) {
        socketRef.current.close();
      }

      socketRef.current = new WebSocket(url);

      socketRef.current.onopen = () => {
        console.log('WebSocket connection established');
      };

      socketRef.current.onmessage = onMessage;

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socketRef.current.onclose = (event) => {
        console.log('WebSocket connection closed:');

        if ( !event.wasClean ) {
          console.log('WebSocket connection closed abnormally, retrying...');
          setTimeout(establishConnection, 5000);
        }
      };
    };

    establishConnection();

    return () => {
      if ( socketRef.current ) {
        socketRef.current.close();
      }
    };
  }, [url, onMessage]);

  return socketRef.current;
};

export default useWebSocket;
