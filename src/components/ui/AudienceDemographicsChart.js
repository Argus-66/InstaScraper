'use client';
import { useState, useEffect } from 'react';

const AudienceDemographicsChart = ({ demographics }) => {
  const [animatedData, setAnimatedData] = useState([]);

  useEffect(() => {
    if (demographics && demographics.length > 0) {
      // Animate the bubbles on mount
      const timer = setTimeout(() => {
        setAnimatedData(demographics);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [demographics]);

  if (!demographics || demographics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading audience demographics...</p>
        </div>
      </div>
    );
  }

  // Calculate bubble sizes and positions for LeetCode-style layout
  const maxPercentage = Math.max(...demographics.map(d => d.percentage));
  const containerSize = 400;
  
  // Generate positions for bubbles in a natural, scattered layout
  const bubbleData = demographics.map((demo, index) => {
    const baseSize = (demo.percentage / maxPercentage) * 120 + 30; // Min 30px, max 150px
    const angle = (index / demographics.length) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
    const radius = 80 + Math.random() * 60; // Scatter around center
    
    const x = containerSize/2 + Math.cos(angle) * radius - baseSize/2;
    const y = containerSize/2 + Math.sin(angle) * radius - baseSize/2;
    
    return {
      ...demo,
      size: baseSize,
      x: Math.max(baseSize/2, Math.min(containerSize - baseSize/2, x)),
      y: Math.max(baseSize/2, Math.min(containerSize - baseSize/2, y)),
      delay: index * 150 // Stagger animation
    };
  });

  return (
    <div className="bg-gray-800/60 backdrop-blur-xl rounded-xl border border-red-500/30 p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        🌍 Audience Demographics
      </h3>
      
      {/* LeetCode-style bubble chart */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Bubble Chart Container */}
        <div className="relative flex-1">
          <div 
            className="relative mx-auto bg-gray-900/50 rounded-xl border border-gray-700/50"
            style={{ width: containerSize, height: containerSize }}
          >
            {bubbleData.map((bubble, index) => (
              <div
                key={bubble.country}
                className={`absolute rounded-full border-2 border-white/20 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-all duration-300 shadow-lg ${
                  animatedData.length > 0 ? 'animate-bounce-in' : 'scale-0'
                }`}
                style={{
                  width: bubble.size,
                  height: bubble.size,
                  left: bubble.x,
                  top: bubble.y,
                  backgroundColor: bubble.color,
                  boxShadow: `0 0 20px ${bubble.color}40`,
                  animationDelay: `${bubble.delay}ms`,
                  fontSize: bubble.size > 80 ? '14px' : bubble.size > 60 ? '12px' : '10px'
                }}
                title={`${bubble.country}: ${bubble.percentage}%`}
              >
                <div className="text-center">
                  <div className="font-bold">{bubble.percentage}%</div>
                  {bubble.size > 60 && (
                    <div className="text-xs opacity-90">{bubble.country}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="lg:w-64">
          <h4 className="text-sm font-semibold text-gray-300 mb-4">Geographic Distribution</h4>
          <div className="space-y-3">
            {demographics.map((demo, index) => (
              <div 
                key={demo.country} 
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-600/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: demo.color }}
                  ></div>
                  <span className="text-gray-200 font-medium text-sm">{demo.country}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{demo.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <p className="text-xs text-blue-200">
              💡 Bubble size represents audience percentage. Hover over bubbles for details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudienceDemographicsChart;