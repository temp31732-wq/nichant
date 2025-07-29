import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, AreaChart as AreaChartIcon } from 'lucide-react';

export type ChartType = 'line' | 'area' | 'bar';

interface ChartSwitcherProps {
  activeChart: ChartType;
  onChartChange: (chart: ChartType) => void;
  className?: string;
}

const ChartSwitcher: React.FC<ChartSwitcherProps> = ({ 
  activeChart, 
  onChartChange, 
  className = '' 
}) => {
  const chartTypes = [
    {
      id: 'line' as ChartType,
      label: 'Line',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Line chart view'
    },
    {
      id: 'area' as ChartType,
      label: 'Area',
      icon: <AreaChartIcon className="w-4 h-4" />,
      description: 'Area chart with gradient fill'
    },
    {
      id: 'bar' as ChartType,
      label: 'Bar',
      icon: <BarChart3 className="w-4 h-4" />,
      description: 'Bar chart view'
    }
  ];

  return (
    <motion.div 
      className={`flex items-center gap-2 p-1 bg-muted/50 rounded-lg backdrop-blur-sm ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {chartTypes.map((chart) => (
        <motion.div key={chart.id} className="relative">
          <Button
            variant={activeChart === chart.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onChartChange(chart.id)}
            className={`flex items-center gap-2 transition-all duration-200 ${
              activeChart === chart.id 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'hover:bg-muted'
            }`}
            title={chart.description}
          >
            {chart.icon}
            <span className="hidden sm:inline">{chart.label}</span>
          </Button>
          
          {/* Active indicator */}
          {activeChart === chart.id && (
            <motion.div
              className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full"
              layoutId="activeChart"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ x: '-50%' }}
            />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ChartSwitcher;