import React from 'react';

const severityConfig = {
  critical: {
    wrap:  'bg-red-50 border-red-200 text-red-800',
    icon:  '🚨',
  },
  warning: {
    wrap:  'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon:  '⚠️',
  },
  info: {
    wrap:  'bg-blue-50 border-blue-200 text-blue-800',
    icon:  'ℹ️',
  },
};

const AlertBanner = ({ alerts = [] }) => {
  if (!alerts.length) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => {
        const cfg = severityConfig[alert.severity] ?? severityConfig.info;
        return (
          <div
            key={i}
            className={`flex items-start gap-3 px-4 py-3 border rounded-md ${cfg.wrap}`}
          >
            <span className="text-base flex-shrink-0 mt-0.5">{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{alert.message}</p>
              {alert.confidence != null && (
                <p className="text-[11px] mt-0.5 opacity-70">
                  Confidence: {(alert.confidence * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlertBanner;
