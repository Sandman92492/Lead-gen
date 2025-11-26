import React, { useState, useEffect, useRef } from 'react';

interface LogEntry {
  id: number;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}

const MobileDebugConsole: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logIdCounterRef = useRef(0);

  useEffect(() => {
    // Intercept console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    const addLog = (type: LogEntry['type'], args: any[]) => {
      const message = args
        .map((arg) => {
          if (typeof arg === 'object') {
            return JSON.stringify(arg);
          }
          return String(arg);
        })
        .join(' ');

      logIdCounterRef.current += 1;
      setLogs((prevLogs) => {
        const newLogs = [
          ...prevLogs,
          {
            id: logIdCounterRef.current,
            type,
            message,
            timestamp: new Date(),
          },
        ];
        // Keep only last 50 logs
        return newLogs.slice(-50);
      });
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('error', args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', args);
    };

    console.info = (...args) => {
      originalInfo(...args);
      addLog('info', args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-300';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono border border-gray-600 hover:bg-black/90 transition-colors"
        aria-label="Open debug console"
      >
        Console ({logs.length})
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-black/95 border border-gray-600 rounded-lg shadow-2xl flex flex-col max-w-sm w-[90vw] max-h-96">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-600 bg-black/50">
        <span className="text-white text-xs font-mono font-bold">Debug Console</span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white text-lg transition-colors"
          aria-label="Close console"
        >
          ✕
        </button>
      </div>

      {/* Logs Container */}
      <div className="flex-1 overflow-y-auto bg-black/80 p-3 space-y-1 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No logs yet...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`${getLogColor(log.type)} break-words`}>
              <span className="text-gray-500">
                {log.timestamp.toLocaleTimeString()}
              </span>{' '}
              <span className="text-gray-400">[{log.type.toUpperCase()}]</span>{' '}
              {log.message}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-600 bg-black/50 flex gap-2">
        <button
          onClick={() => setLogs([])}
          className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
        >
          Clear
        </button>
        <span className="text-gray-400 text-xs flex-1">
          {logs.length} messages
        </span>
      </div>
    </div>
  );
};

export default MobileDebugConsole;
