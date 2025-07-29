import React from 'react';
import { motion } from 'framer-motion';

interface AreaChartProps {
  data: Array<{
    month: number;
    invested: number;
    maturity: number;
    interest: number;
  }>;
  color?: string;
  gradientId?: string;
}

const AreaChart: React.FC<AreaChartProps> = ({ 
  data, 
  color = '#10b981', 
  gradientId = 'areaGradient' 
}) => {
  if (!data.length) return null;

  const maxValue = Math.max(...data.map(d => Math.max(d.invested, d.maturity)));
  const width = 400;
  const height = 200;
  const padding = 40;

  const xScale = (index: number) => (index / (data.length - 1)) * (width - 2 * padding) + padding;
  const yScale = (value: number) => height - padding - ((value / maxValue) * (height - 2 * padding));

  // Create area path for maturity
  const areaPath = data.reduce((path, d, i) => {
    const x = xScale(i);
    const y = yScale(d.maturity);
    
    if (i === 0) {
      return `M ${x} ${height - padding} L ${x} ${y}`;
    }
    return `${path} L ${x} ${y}`;
  }, '') + ` L ${xScale(data.length - 1)} ${height - padding} Z`;

  // Create area path for invested amount
  const investedAreaPath = data.reduce((path, d, i) => {
    const x = xScale(i);
    const y = yScale(d.invested);
    
    if (i === 0) {
      return `M ${x} ${height - padding} L ${x} ${y}`;
    }
    return `${path} L ${x} ${y}`;
  }, '') + ` L ${xScale(data.length - 1)} ${height - padding} Z`;

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
        {/* Gradients */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
            <stop offset="100%" stopColor={color} stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="investedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
          </linearGradient>
        </defs>

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
        
        {/* Animated areas */}
        <motion.path
          d={investedAreaPath}
          fill="url(#investedGradient)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        <motion.path
          d={areaPath}
          fill={`url(#${gradientId})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
        
        {/* Data points with hover effects */}
        {data.map((d, i) => (
          <g key={i}>
            <motion.circle
              cx={xScale(i)}
              cy={yScale(d.invested)}
              r="4"
              fill="#3b82f6"
              className="cursor-pointer hover:r-6 transition-all"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <title>Month {d.month}: Invested ₹{d.invested.toLocaleString()}</title>
            </motion.circle>
            <motion.circle
              cx={xScale(i)}
              cy={yScale(d.maturity)}
              r="4"
              fill={color}
              className="cursor-pointer hover:r-6 transition-all"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 + 0.2, duration: 0.3 }}
            >
              <title>Month {d.month}: Maturity ₹{d.maturity.toLocaleString()}</title>
            </motion.circle>
          </g>
        ))}
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
          <span className="text-sm text-muted-foreground">Total Invested</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          <span className="text-sm text-muted-foreground">Maturity Value</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AreaChart;