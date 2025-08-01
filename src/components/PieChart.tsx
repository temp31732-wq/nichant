import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface PieChartProps {
  data: Array<{
    value: number;
    color: string;
    label: string;
  }>;
  size?: number;
  strokeWidth?: number;
}

const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  size = 200, 
  strokeWidth = 20 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  let cumulativePercentage = 0;
  
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
            
            cumulativePercentage += percentage;
            
            return (
              <Circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                fill="transparent"
                strokeLinecap="round"
              />
            );
          })}
        </G>
      </Svg>
      
      {/* Center text */}
      <View style={[styles.centerText, { width: size, height: size }]}>
        <Text style={styles.totalLabel}>Total Value</Text>
        <Text style={styles.totalValue}>
          ₹{total.toLocaleString('en-IN')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    transform: [{ rotate: '0deg' }],
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
});

export default PieChart;