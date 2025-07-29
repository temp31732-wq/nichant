import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
  timeRemaining?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  target, 
  label, 
  timeRemaining,
  className = '' 
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = percentage >= 100;
  
  return (
    <motion.div 
      className={`p-4 bg-gradient-to-r from-card to-accent/5 rounded-lg border shadow-sm ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <Badge 
          variant={isComplete ? "default" : "secondary"}
          className={isComplete ? "bg-success text-success-foreground" : ""}
        >
          {percentage.toFixed(1)}%
        </Badge>
      </div>
      
      <div className="space-y-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Progress 
            value={percentage} 
            className="h-2 bg-muted"
          />
        </motion.div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>₹{current.toLocaleString()}</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>₹{target.toLocaleString()}</span>
          </div>
        </div>
        
        {timeRemaining && (
          <motion.div 
            className="text-xs text-center text-muted-foreground bg-muted/30 rounded-md py-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            {isComplete ? '🎉 Goal Achieved!' : `⏱️ ${timeRemaining} remaining`}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProgressBar;