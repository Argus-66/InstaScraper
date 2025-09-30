import React from 'react';

export default function DemographicsBubbleChart({ demographics, isAiGenerated = false, category = '' }) {
  if (!demographics || demographics.length === 0) {
    return (
      <div className="p-6 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Audience Demographics</h3>
        <div className="text-gray-400 text-center py-8">
          No demographic data available
        </div>
      </div>
    );
  }

  // Calculate bubble sizes based on percentage
  const maxPercentage = Math.max(...demographics.map(d => d.percentage));
  
  const getBubbleSize = (percentage) => {
    const minSize = 40;
    const maxSize = 120;
    const ratio = percentage / maxPercentage;
    return minSize + (maxSize - minSize) * ratio;
  };

  // Create gradient from flag colors
  const getFlagGradient = (colors, index) => {
    if (colors.length === 1) {
      return colors[0];
    }
    if (colors.length === 2) {
      return `linear-gradient(45deg, ${colors[0]} 50%, ${colors[1]} 50%)`;
    }
    if (colors.length === 3) {
      return `linear-gradient(45deg, ${colors[0]} 33%, ${colors[1]} 33%, ${colors[1]} 66%, ${colors[2]} 66%)`;
    }
    return colors[0];
  };

  return (
    <div className="p-6 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Audience Demographics</h3>
        {isAiGenerated && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">AI Analyzed</span>
          </div>
        )}
      </div>

      {category && category !== 'REGULAR_USER' && (
        <div className="mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700/50">
          <span className="text-blue-300 text-sm font-medium">
            Category: {category.replace(/_/g, ' ')}
          </span>
        </div>
      )}

      {/* Bubble Chart Container */}
      <div className="relative min-h-[300px] bg-gray-800/30 rounded-lg p-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-center gap-4 h-full">
          {demographics.slice(0, 8).map((item, index) => {
            const size = getBubbleSize(item.percentage);
            const flagBackground = getFlagGradient(item.flagColors, index);
            
            return (
              <div
                key={item.country}
                className="relative flex flex-col items-center group transition-all duration-300 hover:scale-110"
                style={{
                  minWidth: size,
                  minHeight: size + 30,
                }}
              >
                {/* Bubble */}
                <div
                  className="rounded-full border-2 border-white/20 shadow-lg flex items-center justify-center relative overflow-hidden group-hover:border-white/40 transition-all duration-300"
                  style={{
                    width: size,
                    height: size,
                    background: flagBackground,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }}
                >
                  {/* Percentage overlay */}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                    <span 
                      className="font-bold text-white drop-shadow-lg"
                      style={{ fontSize: size > 80 ? '14px' : '12px' }}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                  
                  {/* Glow effect */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    style={{ background: flagBackground }}
                  ></div>
                </div>
                
                {/* Country Label */}
                <div className="mt-2 text-center">
                  <span 
                    className="text-white font-medium drop-shadow-sm"
                    style={{ fontSize: size > 80 ? '13px' : '11px' }}
                  >
                    {item.country}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Geographic Distribution</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {demographics.slice(0, 5).map((item, index) => (
            <div key={item.country} className="flex items-center justify-between p-2 bg-gray-800/40 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full border border-white/20"
                  style={{ background: getFlagGradient(item.flagColors, index) }}
                ></div>
                <span className="text-gray-300 text-sm">{item.country}</span>
              </div>
              <span className="text-white font-medium text-sm">{item.percentage}%</span>
            </div>
          ))}
        </div>

        {demographics.length > 5 && (
          <div className="text-center pt-2">
            <span className="text-gray-400 text-xs">
              +{demographics.length - 5} more countries
            </span>
          </div>
        )}
      </div>

      {/* Data Source */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <span className="text-xs text-gray-500">
          {isAiGenerated ? 'Based on AI analysis of account profile' : 'Standard regional distribution'}
        </span>
      </div>
    </div>
  );
}