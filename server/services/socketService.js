import { Server } from 'socket.io';

let io = null;

export const initSocket = (server) => {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      transports: ['websocket'],
      pingTimeout: 60000,
      pingInterval: 25000,
      connectionStateRecovery: {
        maxDisconnectionDuration: 2000
      }
    });
    
    console.log('Socket.IO initialized');
    
    io.on('connection', (socket) => {
      // Log only initial connection
      if (!socket.recovered) {
        console.log('New client connected:', socket.id);
      }
  
      socket.on('disconnect', (reason) => {
        if (reason === 'transport close' || reason === 'client namespace disconnect') {
          console.log('Client disconnected:', socket.id);
        }
      });
    });
  }
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocket first.');
  }
  
  // Add debug wrapper
  return {
    ...io,
    emit: (event, data) => {
      console.log('Emitting socket event:', event, data);
      io.emit(event, data);
    }
  };
};
