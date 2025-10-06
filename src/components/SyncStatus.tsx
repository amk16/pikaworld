import React, { useState, useEffect } from 'react';
import { enhancedWorkspaceService } from '../services/enhancedWorkspaceService';

interface AutosaveStatusProps {
  className?: string;
}

const AutosaveStatus: React.FC<AutosaveStatusProps> = ({ className = '' }) => {
  const [autosaveStatus, setAutosaveStatus] = useState({
    isOnline: false,
    lastAutosave: null as Date | null,
    isAutosaving: false
  });
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  useEffect(() => {
    // Update autosave status every 5 seconds
    const interval = setInterval(async () => {
      const status = enhancedWorkspaceService.getAutosaveStatus();
      setAutosaveStatus(status);
    }, 5000);

    // Initial status check
    const checkInitialStatus = async () => {
      setIsCheckingConnection(true);
      try {
        await enhancedWorkspaceService.checkConnection();
        const status = enhancedWorkspaceService.getAutosaveStatus();
        setAutosaveStatus(status);
      } catch (error) {
        console.error('Error checking connection:', error);
      } finally {
        setIsCheckingConnection(false);
      }
    };

    checkInitialStatus();

    return () => clearInterval(interval);
  }, []);

  const handleCheckConnection = async () => {
    setIsCheckingConnection(true);
    try {
      await enhancedWorkspaceService.checkConnection();
      const status = enhancedWorkspaceService.getAutosaveStatus();
      setAutosaveStatus(status);
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const getStatusIcon = () => {
    if (isCheckingConnection) return '🔄';
    if (autosaveStatus.isAutosaving) return '💾';
    if (!autosaveStatus.isOnline) return '🔴';
    return '🟢';
  };

  const getStatusText = () => {
    if (isCheckingConnection) return 'Checking...';
    if (autosaveStatus.isAutosaving) return 'Autosaving...';
    if (!autosaveStatus.isOnline) return 'Offline';
    return 'Auto-saved';
  };

  const getStatusColor = () => {
    if (isCheckingConnection) return 'text-blue-600';
    if (autosaveStatus.isAutosaving) return 'text-purple-600';
    if (!autosaveStatus.isOnline) return 'text-red-600';
    return 'text-green-600';
  };

  const formatLastAutosave = () => {
    if (!autosaveStatus.lastAutosave) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - autosaveStatus.lastAutosave.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status Icon and Text */}
      <div 
        className={`flex items-center gap-1 text-xs font-medium ${getStatusColor()}`}
        title={`Cloud autosave status. Last autosave: ${formatLastAutosave()}`}
      >
        <span className="text-sm">{getStatusIcon()}</span>
        <span className="hidden sm:inline">{getStatusText()}</span>
      </div>

      {/* Check Connection Button */}
      <button
        onClick={handleCheckConnection}
        disabled={isCheckingConnection}
        className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
          isCheckingConnection
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
        title="Check connection"
      >
        {isCheckingConnection ? '⏳' : '🔄'}
      </button>

      {/* Connection Status Indicator */}
      <div 
        className={`w-2 h-2 rounded-full ${
          autosaveStatus.isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}
        title={autosaveStatus.isOnline ? 'Connected to cloud' : 'Disconnected from cloud'}
      />
    </div>
  );
};

export default AutosaveStatus;
