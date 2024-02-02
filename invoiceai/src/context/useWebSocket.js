import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(url);

    newSocket.on('connect', () => {
      console.log('Connesso al server WebSocket');
    });

    // Aggiungi altri gestori di eventi se necessario

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [url]);

  return socket;
};

export default useWebSocket;
