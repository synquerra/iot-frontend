import React, { useState, useEffect } from "react";
import { Loading } from "../design-system/components";
import { cn } from "../design-system/utils/cn";
import { fetchDeviceCommands, parseDeviceCommands } from "../utils/deviceCommandsAPI";
import { fetchDeviceConfig, getConfigAcknowledgments } from "../utils/deviceConfigAPI";

export default function CommandHistory({ imei, commandType, triggerRefresh }) {
  const [commandHistory, setCommandHistory] = useState([]);
  const [configAcknowledgments, setConfigAcknowledgments] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHistory = async () => {
    if (!imei) return;
    
    setHistoryLoading(true);
    setHistoryError(null);
    
    try {
      const [commands, configs] = await Promise.all([
        fetchDeviceCommands(imei, 5),
        fetchDeviceConfig(imei, 5)
      ]);
      
      const parsedCommands = parseDeviceCommands(commands);
      
      // Filter by command type if provided
      const filteredCommands = commandType 
        ? parsedCommands.filter(cmd => cmd.command === commandType)
        : parsedCommands;
      
      setCommandHistory(filteredCommands);
      setConfigAcknowledgments(getConfigAcknowledgments(configs));
    } catch (error) {
      setHistoryError('Failed to load command history');
      setCommandHistory([]);
      setConfigAcknowledgments([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [imei, commandType]);

  // Auto-refresh when triggerRefresh changes
  useEffect(() => {
    if (triggerRefresh > 0) {
      // Wait 2 seconds before refreshing (same as DeviceSettings.jsx)
      const timer = setTimeout(() => {
        fetchHistory();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [triggerRefresh]);

  const refreshCommandHistory = async () => {
    if (!imei) return;
    
    setIsRefreshing(true);
    await fetchHistory();
    setIsRefreshing(false);
  };

  if (!imei) return null;

  return (
    <div className="mt-8 pt-8 border-t-2 border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <i className="fas fa-history text-white"></i>
            </div>
            Command History
          </h4>
          <p className="text-gray-600 text-sm mt-1 ml-13">View recent commands and device responses</p>
          <div className="flex items-center gap-2 mt-2 ml-13">
            <i className="fas fa-mobile-alt text-blue-600"></i>
            <span className="text-sm text-gray-700">
              Showing history for device: 
              <span className="font-mono font-bold text-blue-600 ml-2 bg-blue-50 px-2 py-1 rounded">{imei}</span>
            </span>
          </div>
        </div>
      
        <button
          onClick={refreshCommandHistory}
          disabled={isRefreshing || historyLoading}
          className={cn(
            "px-5 py-2.5 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold",
            "hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md",
            "min-w-[140px] flex items-center justify-center gap-2",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-400 disabled:text-gray-400 disabled:hover:bg-transparent"
          )}
        >
          {isRefreshing ? (
            <>
              <Loading type="spinner" size="sm" color="blue" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <i className="fas fa-redo"></i>
              Refresh
            </>
          )}
        </button>
      </div>

      {historyLoading && (
        <div className="flex items-center justify-center py-12">
          <Loading type="spinner" size="lg" color="blue" />
          <span className="ml-3 text-gray-600">Loading command history...</span>
        </div>
      )}

      {historyError && !historyLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <i className="fas fa-exclamation-circle text-red-600 text-xl mt-0.5"></i>
            <div>
              <h5 className="text-red-800 font-semibold mb-1">Error Loading History</h5>
              <p className="text-red-700 text-sm">{historyError}</p>
            </div>
          </div>
        </div>
      )}

      {!historyLoading && !historyError && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-md border border-blue-100 p-6">
            <h5 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow">
                <i className="fas fa-paper-plane text-white text-sm"></i>
              </div>
              Sent Commands
              <span className="ml-auto text-xs text-blue-700 bg-blue-100 px-3 py-1 rounded-full font-semibold">Last 5</span>
            </h5>
            
            {commandHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-inbox text-3xl text-gray-400"></i>
                </div>
                <p className="text-sm font-medium">No commands sent yet</p>
                <p className="text-xs text-gray-400 mt-1">Commands will appear here once sent</p>
              </div>
            ) : (
              <div className="space-y-3">
                {commandHistory.map((cmd) => {
                  const statusColors = {
                    PUBLISHED: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm',
                    PENDING: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-sm',
                    FAILED: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm',
                    default: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                  };
                  const statusClass = statusColors[cmd.status] || statusColors.default;

                  return (
                    <div 
                      key={cmd.id} 
                      className="bg-white rounded-lg p-5 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-800 font-bold text-base">{cmd.command}</span>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold",
                            statusClass
                          )}>
                            {cmd.status}
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-500 text-xs font-medium bg-gray-100 px-3 py-1 rounded-full inline-block">
                        <i className="fas fa-clock mr-1"></i>
                        {new Date(cmd.createdAt).toLocaleString()}
                      </span>
                      
                      {cmd.payload && Object.keys(cmd.payload).length > 0 && (
                        <div className="mt-3 pt-3 border-t-2 border-gray-100">
                          <p className="text-gray-700 text-xs font-bold mb-2 flex items-center gap-1">
                            <i className="fas fa-code text-blue-600"></i>
                            Parameters:
                          </p>
                          <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400 shadow-inner">
                            {JSON.stringify(cmd.payload, null, 2)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-md border border-green-100 p-6">
            <h5 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow">
                <i className="fas fa-check-circle text-white text-sm"></i>
              </div>
              Device Acknowledgments
              <span className="ml-auto text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full font-semibold">Last 5</span>
            </h5>
            
            {configAcknowledgments.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check-circle text-3xl text-gray-400"></i>
                </div>
                <p className="text-sm font-medium">No acknowledgments received yet</p>
                <p className="text-xs text-gray-400 mt-1">Device responses will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {configAcknowledgments.map((ack) => (
                  <div 
                    key={ack.id} 
                    className="bg-white rounded-lg p-5 border-2 border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-check text-green-600 font-bold"></i>
                        </div>
                        <span className="text-gray-800 font-bold">{ack.rawBody}</span>
                      </div>
                    </div>
                    <span className="text-gray-500 text-xs font-medium bg-gray-100 px-3 py-1 rounded-full inline-block">
                      <i className="fas fa-clock mr-1"></i>
                      {new Date(ack.deviceTimestamp).toLocaleString()}
                    </span>
                    
                    <div className="mt-3 pt-3 border-t-2 border-gray-100">
                      <p className="text-gray-600 text-xs flex items-center gap-2">
                        <i className="fas fa-tag text-green-600"></i>
                        <span className="font-bold">Topic:</span> 
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{ack.topic}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
