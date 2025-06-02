import React, { useEffect, useState } from 'react';
import { socketMonitor, ConnectionState } from '../../utils/socketMonitor';
import { Wifi, WifiOff, AlertCircle, Clock } from 'lucide-react';

const ConnectionStatus: React.FC = () => {
  const [state, setState] = useState<ConnectionState>(socketMonitor.getConnectionState());

  useEffect(() => {
    const updateState = () => {
      setState(socketMonitor.getConnectionState());
    };

    // Update state every second
    const interval = setInterval(updateState, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (state.status) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'error':
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (state.status) {
      case 'connected':
        return <Wifi className="w-4 h-4" />;
      case 'connecting':
        return <Clock className="w-4 h-4 animate-spin" />;
      case 'error':
      case 'disconnected':
        return <WifiOff className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (state.status) {
      case 'connected':
        return `Connected (${state.transport})`;
      case 'connecting':
        return `Connecting... (Attempt ${state.reconnectAttempts})`;
      case 'error':
        return `Error: ${state.lastError}`;
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const getNetworkInfo = () => {
    if (!state.networkType) return null;
    return (
      <span className="text-xs text-gray-500 ml-2">
        Network: {state.networkType}
        {state.latency > 0 && ` • Latency: ${state.latency}ms`}
      </span>
    );
  };

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-sm">
      <div className={`flex items-center ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="ml-2 text-sm font-medium">{getStatusText()}</span>
      </div>
      {getNetworkInfo()}
    </div>
  );
};

export default ConnectionStatus; 