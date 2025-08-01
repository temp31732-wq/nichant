import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = '#e5e7eb',
  progressColor = '#3b82f6',
  showPercentage = false,
  animated = true,
  label,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: clampedProgress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(clampedProgress);
    }
  }, [clampedProgress, animated]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBackground, { height, backgroundColor }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                height,
                backgroundColor: progressColor,
                width: animatedValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        </View>
        {showPercentage && (
          <Text style={styles.percentage}>{Math.round(clampedProgress)}%</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBackground: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
  },
  percentage: {
    marginLeft: 12,
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
});

export default ProgressBar;