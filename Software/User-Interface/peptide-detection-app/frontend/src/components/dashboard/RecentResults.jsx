import React from 'react';

const dangerBadge = (level) => {
  const map = {
    critical: 'bg-red-100 text-red-700',
    high:     'bg-orange-100 text-orange-700',
    medium:   'bg-yellow-100 text-yellow-700',
    low:      'bg-blue-100 text-blue-700',
    safe:     'bg-green-100 text-green-700',
    unknown:  'bg-purple-100 text-purple-700',
  };
  return map[level] || map.unknown;
};

const RecentResults = ({ results = [] }) => (
  <div className="bg-card border border-border rounded-lg shadow-card">
    <div className="px-5 py-4 border-b border-border">
      <h3 className="text-sm font-semibold text-foreground">Live Detections</h3>
    </div>

    <div className="p-4">
      {results.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-8">
          No detections yet. Start an analysis session.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin">
          {results.slice(0, 20).map((result, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/40 hover:bg-muted transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-foreground truncate">
                  {result.matches?.[0]?.name ?? 'Unknown peptide'}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {((result.confidence ?? 0) * 100).toFixed(1)}% confidence
                </div>
              </div>
              <span className={`ml-3 flex-shrink-0 px-1.5 py-0.5 text-[11px] font-medium rounded-md ${
                dangerBadge(result.matches?.[0]?.dangerLevel)
              }`}>
                {result.matches?.[0]?.dangerLevel ?? 'unknown'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default RecentResults;
