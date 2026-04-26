import React from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';

const dangerBadge = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-blue-100 text-blue-700',
  safe:     'bg-green-100 text-green-700',
  unknown:  'bg-purple-100 text-purple-700',
};

const dangerBar = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  medium:   'bg-yellow-500',
  low:      'bg-blue-500',
  safe:     'bg-green-500',
  unknown:  'bg-purple-500',
};

const ResultsPanel = ({ sessionData }) => {
  const { analysisResults } = useWebSocket();
  const liveResults    = analysisResults;
  const storedResults  = sessionData?.results ?? [];
  const displayResults = liveResults.length > 0 ? liveResults : storedResults;

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Detection Results</h3>
      </div>

      <div className="p-4">
        {displayResults.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-10">No detections yet.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
            {displayResults.slice(0, 30).map((result, i) => {
              const name  = result.peptide_name ?? result.matches?.[0]?.name ?? 'Unknown';
              const level = result.danger_level  ?? result.matches?.[0]?.dangerLevel ?? 'safe';
              const conf  = result.confidence_level ?? result.confidence ?? 0;
              const pct   = result.match_percentage ?? null;

              return (
                <div key={i} className="px-3 py-2.5 border border-border rounded-md hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground truncate pr-2">{name}</span>
                    <span className={`flex-shrink-0 px-1.5 py-0.5 text-[11px] font-medium rounded-md ${dangerBadge[level] ?? dangerBadge.safe}`}>
                      {level}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-1.5">
                    <span className="text-[11px] text-muted-foreground">
                      Confidence: <span className="font-medium text-foreground">{(conf * 100).toFixed(1)}%</span>
                    </span>
                    {pct != null && (
                      <span className="text-[11px] text-muted-foreground">
                        Match: <span className="font-medium text-foreground">{pct.toFixed(1)}%</span>
                      </span>
                    )}
                  </div>
                  <div className="bg-muted rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all ${dangerBar[level] ?? dangerBar.safe}`}
                      style={{ width: `${Math.min(conf * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;
