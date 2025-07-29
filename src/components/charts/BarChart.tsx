import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface BarChartProps {
  data: Array<{
    month: number;
    invested: number;
    maturity: number;
    interest: number;
    monthlyInvestment?: number;
  }>;
  type?: 'stacked' | 'grouped';
}

const BarChart: React.FC<BarChartProps> = ({ data, type = 'stacked' }) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  
  if (!data.length) return null;

  const maxValue = Math.max(...data.map(d => d.maturity));
  const width = 400;
  const height = 200;
  const padding = 40;
  const barWidth = (width - 2 * padding) / data.length * 0.8;

  const xScale = (index: number) => padding + (index * (width - 2 * padding) / data.length) + ((width - 2 * padding) / data.length - barWidth) / 2;
  const yScale = (value: number) => height - padding - ((value / maxValue) * (height - 2 * padding));
  const heightScale = (value: number) => (value / maxValue) * (height - 2 * padding);

  return (
    <div className="w-full bg-card rounded-lg border p-4 shadow-lg backdrop-blur-sm bg-white/50">
      <motion.svg 
        width={width} 
        height={height} 
        className="w-full h-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <g key={ratio}>
            <line
              x1={padding}
              y1={height - padding - (ratio * (height - 2 * padding))}
              x2={width - padding}
              y2={height - padding - (ratio * (height - 2 * padding))}
              stroke="hsl(var(--border))"
              strokeDasharray="2,2"
              opacity={0.3}
            />
            <text
              x={padding - 10}
              y={height - padding - (ratio * (height - 2 * padding)) + 4}
              fill="hsl(var(--muted-foreground))"
              fontSize="10"
              textAnchor="end"
            >
              ₹{((maxValue * ratio) / 100000).toFixed(0)}L
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const x = xScale(i);
          const investedHeight = heightScale(d.invested);
          const interestHeight = heightScale(d.interest);
          
          if (type === 'stacked') {
            return (
              <g key={i}>
                {/* Principal bar */}
                <motion.rect
                  x={x}
                  y={yScale(d.invested)}
                  width={barWidth}
                  height={investedHeight}
                  fill="#3b82f6"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                  initial={{ height: 0, y: height - padding }}
                  animate={{ height: investedHeight, y: yScale(d.invested) }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                >
                  <title>Month {d.month}: Principal ₹{d.invested.toLocaleString()}</title>
                </motion.rect>
                
                {/* Interest bar */}
                <motion.rect
                  x={x}
                  y={yScale(d.maturity)}
                  width={barWidth}
                  height={interestHeight}
                  fill="#10b981"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                  initial={{ height: 0, y: yScale(d.invested) }}
                  animate={{ height: interestHeight, y: yScale(d.maturity) }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.6, ease: "easeOut" }}
                >
                  <title>Month {d.month}: Interest ₹{d.interest.toLocaleString()}</title>
                </motion.rect>

                {/* Hover indicator */}
                {hoveredBar === i && (
                  <motion.rect
                    x={x - 2}
                    y={yScale(d.maturity) - 2}
                    width={barWidth + 4}
                    height={heightScale(d.maturity) + 4}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    rx="4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </g>
            );
          } else {
            // Grouped bars
            const halfBarWidth = barWidth / 2 - 2;
            return (
              <g key={i}>
                {/* Principal bar */}
                <motion.rect
                  x={x}
                  y={yScale(d.invested)}
                  width={halfBarWidth}
                  height={investedHeight}
                  fill="#3b82f6"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  initial={{ height: 0, y: height - padding }}
                  animate={{ height: investedHeight, y: yScale(d.invested) }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                >
                  <title>Month {d.month}: Principal ₹{d.invested.toLocaleString()}</title>
                </motion.rect>
                
                {/* Interest bar */}
                <motion.rect
                  x={x + halfBarWidth + 4}
                  y={yScale(d.interest)}
                  width={halfBarWidth}
                  height={heightScale(d.interest)}
                  fill="#10b981"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  initial={{ height: 0, y: height - padding }}
                  animate={{ height: heightScale(d.interest), y: yScale(d.interest) }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.6, ease: "easeOut" }}
                >
                  <title>Month {d.month}: Interest ₹{d.interest.toLocaleString()}</title>
                </motion.rect>
              </g>
            );
          }
        })}

        {/* X-axis labels for every 6th month */}
        {data.filter((_, i) => i % 6 === 0).map((d, i) => {
          const originalIndex = data.findIndex(item => item.month === d.month);
          return (
            <text
              key={d.month}
              x={xScale(originalIndex) + barWidth / 2}
              y={height - 10}
              fill="hsl(var(--muted-foreground))"
              fontSize="10"
              textAnchor="middle"
            >
              {d.month}
            </text>
          );
        })}
      </motion.svg>
      
      {/* Legend */}
      <motion.div 
        className="flex items-center justify-center gap-4 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-muted-foreground">Principal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-muted-foreground">Interest</span>
        </div>
      </motion.div>
    </div>
  );
};

export default BarChart;