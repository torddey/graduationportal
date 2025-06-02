import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { socketMonitor } from '../utils/socketMonitor';

// Simple client-side logger
const logger = {
  info: (message: string, category?: string) => {
    console.log(`%c[${category || 'Socket'}] ${message}`, 'color: #2196F3');
  },
  warn: (message: string, category?: string) => {
    console.warn(`%c[${category || 'Socket'}] ${message}`, 'color: #FFC107');
  },
  error: (message: string, category?: string) => {
    console.error(`%c[${category || 'Socket'}] ${message}`, 'color: #F44336');
  },
  debug: (message: string, category?: string) => {
    if (import.meta.env.DEV) {
      console.debug(`%c[${category || 'Socket'}] ${message}`, 'color: #9E9E9E');
    }
  }
};

// Ensure we're using the correct base URL without any path segments
const SOCKET_URL = (() => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Remove any trailing slashes and /api if present
  return baseUrl.replace(/\/api\/?$/, '');
})();

logger.info(`Using Socket.IO URL: ${SOCKET_URL}`, 'Config');

// Use a ref to persist the socket instance across re-renders
let socket: Socket | null = null;

export interface CsvUploadCompleteEvent {
  success: boolean;
  count: number;
  errors: string[];
  timestamp: string;
}

interface ConnectionSuccessEvent {
  id: string;
  timestamp: string;
  transport: string;
  namespace: string;
  reconnection: boolean;
  pingInterval: number;
  pingTimeout: number;
}

// Track active listeners to prevent duplicates
const activeListeners = new Set<(data: CsvUploadCompleteEvent) => void>();

export const useSocket = (onCsvUploadComplete: (data: CsvUploadCompleteEvent) => void) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const componentRef = useRef<string>(Math.random().toString(36).substring(7));
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Memoize the callback to prevent unnecessary re-renders
  const handleCsvUploadComplete = useCallback((data: CsvUploadCompleteEvent) => {
    logger.info(`Received csv-upload-complete event: ${JSON.stringify(data)}`, 'Event');
    onCsvUploadComplete(data);
  }, [onCsvUploadComplete]);

  useEffect(() => {
    logger.info(`Initializing socket connection...`, 'Connection');
    
    const initializeSocket = () => {
      if (!socket) {
        const config = socketMonitor.getConfig();
        const connectOptions = {
          ...config,
          transports: ['websocket', 'polling'],
          withCredentials: true,
          path: '/socket.io/',
          forceNew: true,
          autoConnect: true,
          query: {
            clientType: 'admin-dashboard'
          }
        };

        logger.debug(`Attempting connection with options: ${JSON.stringify(connectOptions)}`, 'Config');

        socket = io(SOCKET_URL, connectOptions);
        
        // Initialize socket monitoring
        socketMonitor.initialize(socket);

        // Handle connection success event
        socket.on('connection-success', (data: ConnectionSuccessEvent) => {
          logger.info(`Received connection success: ${JSON.stringify(data)}`, 'Connection');
          
          // Update socket configuration if server suggests different values
          if (data.pingInterval !== config.pingInterval || data.pingTimeout !== config.pingTimeout) {
            socketMonitor.updateConfig({
              pingInterval: data.pingInterval,
              pingTimeout: data.pingTimeout
            });
          }
        });

        // Check if this listener is already registered
        if (!activeListeners.has(handleCsvUploadComplete)) {
          logger.info('Registering new csv-upload-complete listener', 'Event');
          activeListeners.add(handleCsvUploadComplete);
          socket.on('csv-upload-complete', handleCsvUploadComplete);
        } else {
          logger.debug('Listener already registered, skipping', 'Event');
        }

        // Subscribe to connection state changes
        const updateConnectionState = () => {
          const state = socketMonitor.getConnectionState();
          setIsConnected(state.status === 'connected');
          setLastError(state.lastError);
          setReconnectAttempts(state.reconnectAttempts);
        };

        // Update state every second
        const stateInterval = setInterval(updateConnectionState, 1000);

        return () => {
          clearInterval(stateInterval);
        };
      } else {
        logger.info(`Using existing socket connection. ID: ${socket.id}`, 'Connection');
        setIsConnected(socket.connected);
      }
    };

    const cleanup = initializeSocket();

    return () => {
      logger.info('Cleaning up socket listener', 'Connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (cleanup) {
        cleanup();
      }
      
      // Clean up specific listener when component unmounts
      socket?.off('csv-upload-complete', handleCsvUploadComplete);
      activeListeners.delete(handleCsvUploadComplete);
      
      // If no more listeners, disconnect the socket
      if (activeListeners.size === 0) {
        logger.info('No more active listeners, disconnecting socket', 'Connection');
        socket?.disconnect();
        socket = null;
        socketMonitor.cleanup();
      }
    };
  }, [handleCsvUploadComplete]);

  return { 
    isConnected, 
    socketId: socket?.id,
    lastError,
    reconnectAttempts,
    connectionState: socketMonitor.getConnectionState()
  };
};