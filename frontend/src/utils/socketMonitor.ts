import { Socket, Manager } from 'socket.io-client';

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

export interface ConnectionState {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastError: string | null;
  reconnectAttempts: number;
  transport: string | null;
  latency: number;
  networkType: string | null;
  lastPingTime: number;
}

export interface SocketConfig {
  timeout: number;
  pingTimeout: number;
  pingInterval: number;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  reconnectionDelayMax: number;
}

class SocketMonitor {
  private static instance: SocketMonitor;
  private connectionState: ConnectionState;
  private config: SocketConfig;
  private pingInterval: NodeJS.Timeout | null = null;
  private networkMonitor: any = null;

  private constructor() {
    this.connectionState = {
      status: 'disconnected',
      lastError: null,
      reconnectAttempts: 0,
      transport: null,
      latency: 0,
      networkType: null,
      lastPingTime: Date.now()
    };

    this.config = {
      timeout: 60000,
      pingTimeout: 120000,
      pingInterval: 30000,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    };
  }

  public static getInstance(): SocketMonitor {
    if (!SocketMonitor.instance) {
      SocketMonitor.instance = new SocketMonitor();
    }
    return SocketMonitor.instance;
  }

  public initialize(socket: Socket): void {
    this.setupNetworkMonitoring();
    this.setupSocketMonitoring(socket);
    this.startPingMonitoring();
  }

  private setupNetworkMonitoring(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.connectionState.networkType = connection.effectiveType;
      
      connection.addEventListener('change', () => {
        this.connectionState.networkType = connection.effectiveType;
        logger.info(`Network type changed to: ${connection.effectiveType}`, 'Network');
        
        // Adjust socket configuration based on network type
        if (connection.effectiveType === '4g') {
          this.config.pingInterval = 30000;
        } else if (connection.effectiveType === '3g') {
          this.config.pingInterval = 45000;
        } else {
          this.config.pingInterval = 60000;
        }
        logger.debug(`Updated ping interval to ${this.config.pingInterval}ms`, 'Network');
      });
    }
  }

  private setupSocketMonitoring(socket: Socket): void {
    const manager = socket.io as Manager;

    // Monitor connection state
    socket.on('connect', () => {
      this.connectionState.status = 'connected';
      this.connectionState.lastError = null;
      this.connectionState.reconnectAttempts = 0;
      this.connectionState.transport = socket.io.engine.transport.name;
      this.connectionState.lastPingTime = Date.now();
      logger.info(`Connected via ${this.connectionState.transport}`, 'Connection');
    });

    socket.on('disconnect', (reason) => {
      this.connectionState.status = 'disconnected';
      this.connectionState.lastError = `Disconnected: ${reason}`;
      logger.warn(`Disconnected: ${reason}`, 'Connection');
    });

    // Monitor reconnection attempts
    manager.on('reconnect_attempt', (attempt) => {
      this.connectionState.reconnectAttempts = attempt;
      this.connectionState.status = 'connecting';
      logger.info(`Reconnection attempt ${attempt}`, 'Connection');
    });

    // Monitor transport changes
    socket.io.engine.on('upgrade', (transport) => {
      this.connectionState.transport = transport.name;
      logger.info(`Transport upgraded to ${transport.name}`, 'Transport');
    });

    // Monitor errors
    socket.on('error', (error) => {
      this.connectionState.status = 'error';
      this.connectionState.lastError = error.message;
      logger.error(`Error: ${error.message}`, 'Connection');
    });

    // Monitor ping/pong
    socket.io.engine.on('ping', () => {
      this.connectionState.lastPingTime = Date.now();
      logger.debug('Ping sent', 'Ping');
    });

    socket.io.engine.on('pong', () => {
      const latency = Date.now() - this.connectionState.lastPingTime;
      this.connectionState.latency = latency;
      if (latency > 1000) {
        logger.warn(`High latency detected: ${latency}ms`, 'Ping');
      } else {
        logger.debug(`Latency: ${latency}ms`, 'Ping');
      }
    });
  }

  private startPingMonitoring(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastPing = now - this.connectionState.lastPingTime;

      if (timeSinceLastPing > this.config.pingTimeout) {
        logger.warn(`No ping received for ${timeSinceLastPing}ms`, 'Ping');
        this.connectionState.status = 'error';
        this.connectionState.lastError = 'Ping timeout';
      }
    }, this.config.pingInterval);
  }

  public getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  public getConfig(): SocketConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SocketConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.debug(`Configuration updated: ${JSON.stringify(newConfig)}`, 'Config');
  }

  public cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
      logger.info('Socket monitor cleaned up', 'Monitor');
    }
  }
}

export const socketMonitor = SocketMonitor.getInstance(); 