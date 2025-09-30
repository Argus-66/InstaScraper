import React from 'react';

const DemographicsBubbleChart = ({ demographics }) => {
  if (!demographics || demographics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No demographic data available
      </div>
    );
  }

  // Calculate bubble sizes based on percentages
  const maxPercentage = Math.max(...demographics.map(d => d.percentage));
  
  const getBubbleSize = (percentage) => {
    const minSize = 40;
    const maxSize = 120;
    const ratio = percentage / maxPercentage;
    return minSize + (maxSize - minSize) * ratio;
  };

  // Generate packed bubble positions (LeetCode style)
  const generatePackedPositions = (demographics) => {
    const containerWidth = 500;
    const containerHeight = 300;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    const positions = [];
    
    // Sort by percentage (largest first)
    const sortedData = [...demographics].sort((a, b) => b.percentage - a.percentage);
    
    // Place largest bubble in center
    if (sortedData.length > 0) {
      positions.push({ x: centerX, y: centerY });
    }
    
    // Pack remaining bubbles around the center using force simulation approach
    for (let i = 1; i < sortedData.length; i++) {
      const currentRadius = getBubbleSize(sortedData[i].percentage) / 2;
      let bestPosition = { x: centerX, y: centerY };
      let bestDistance = Infinity;
      
      // Try different angles around existing bubbles
      for (let angle = 0; angle < 360; angle += 30) {
        for (let distance = 60; distance < 150; distance += 20) {
          const x = centerX + Math.cos(angle * Math.PI / 180) * distance;
          const y = centerY + Math.sin(angle * Math.PI / 180) * distance;
          
          // Check bounds
          if (x - currentRadius < 0 || x + currentRadius > containerWidth || 
              y - currentRadius < 0 || y + currentRadius > containerHeight) {
            continue;
          }
          
          // Check collision with existing bubbles
          let collision = false;
          for (let j = 0; j < i; j++) {
            const otherPos = positions[j];
            const otherRadius = getBubbleSize(sortedData[j].percentage) / 2;
            const dx = x - otherPos.x;
            const dy = y - otherPos.y;
            const minDistance = currentRadius + otherRadius + 5; // 5px padding
            
            if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
              collision = true;
              break;
            }
          }
          
          if (!collision) {
            const distanceFromCenter = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
            if (distanceFromCenter < bestDistance) {
              bestDistance = distanceFromCenter;
              bestPosition = { x, y };
            }
          }
        }
      }
      
      positions.push(bestPosition);
    }
    
    // Map back to original order
    const finalPositions = new Array(demographics.length);
    sortedData.forEach((demo, sortedIndex) => {
      const originalIndex = demographics.findIndex(d => d.country === demo.country);
      finalPositions[originalIndex] = positions[sortedIndex];
    });
    
    return finalPositions;
  };

  const positions = generatePackedPositions(demographics);

  return (
    <div className="space-y-6">
      {/* Bubble Chart */}
      <div className="relative">
        <h3 className="text-lg font-semibold text-white mb-4">Audience Demographics</h3>
        
        {/* SVG Container for bubbles */}
        <div className="relative bg-gray-800/50 rounded-lg p-6 h-80 overflow-hidden">
          <svg 
            viewBox="0 0 500 300" 
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {demographics.map((demo, index) => {
              const position = positions[index] || { x: 250, y: 150 };
              const size = getBubbleSize(demo.percentage);
              const radius = size / 2;
              
              return (
                <g key={index}>
                  {/* Bubble */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={radius}
                    fill={demo.color}
                    fillOpacity={0.9}
                    stroke={demo.color}
                    strokeWidth={2}
                    className="transition-all duration-500 hover:scale-110 cursor-pointer animate-bounce-in"
                    style={{
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
                      animationDelay: `${index * 0.1}s`
                    }}
                  />
                  
                  {/* Percentage text */}
                  <text
                    x={position.x}
                    y={position.y - 3}
                    textAnchor="middle"
                    className="fill-white font-bold text-sm pointer-events-none"
                    style={{ fontSize: '12px' }}
                  >
                    {demo.percentage}%
                  </text>
                  
                  {/* Country name */}
                  <text
                    x={position.x}
                    y={position.y + 10}
                    textAnchor="middle"
                    className="fill-white text-xs pointer-events-none"
                    style={{ fontSize: '10px' }}
                  >
                    {demo.country.length > 8 ? demo.country.substring(0, 8) + '...' : demo.country}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* Disclaimer */}
          <div className="absolute bottom-2 left-2 text-xs text-gray-500">
            * This may not be accurate data, just an estimate
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicsBubbleChart;