import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { TrendingUp, DollarSign, Percent, ChartPie as PieChartIcon, ChartBar as BarChart3 } from 'lucide-react-native';
import { CalculationResult } from './Calculator';
import { formatCurrency } from '../utils/formatters';
import PieChart from './PieChart';
import ProgressBar from './ProgressBar';

const { width } = Dimensions.get('window');

interface ResultsDisplayProps {
  results: CalculationResult | null;
  calculatorType: string;
  loading: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, calculatorType, loading }) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating...</Text>
        </View>
      </View>
    );
  }

  if (!results) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <TrendingUp size={48} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Investment Results</Text>
          <Text style={styles.emptyDescription}>
            Enter your investment details and calculate to see results
          </Text>
        </View>
      </View>
    );
  }

  const getCalculatorTitle = () => {
    switch (calculatorType) {
      case 'fd': return 'Fixed Deposit';
      case 'rd': return 'Recurring Deposit';
      case 'sip': return 'SIP Investment';
      default: return 'Investment';
    }
  };

  const SummaryCard = ({ title, value, icon, color }: any) => (
    <Animated.View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <View style={styles.summaryCardHeader}>
        <Text style={styles.summaryCardTitle}>{title}</Text>
        <View style={[styles.summaryCardIcon, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
      </View>
      <Text style={[styles.summaryCardValue, { color }]}>
        {formatCurrency(value)}
      </Text>
    </Animated.View>
  );

  const returnPercentage = ((results.interestEarned / results.totalInvested) * 100).toFixed(2);
  const growthMultiple = (results.maturityValue / results.totalInvested).toFixed(2);
  
  // Prepare data for pie chart
  const pieChartData = [
    {
      value: results.totalInvested,
      color: '#3b82f6',
      label: 'Principal'
    },
    {
      value: results.interestEarned,
      color: '#10b981',
      label: 'Interest'
    }
  ];
  
  const principalPercentage = (results.totalInvested / results.maturityValue) * 100;
  const interestPercentage = (results.interestEarned / results.maturityValue) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{getCalculatorTitle()} Results</Text>
        <Text style={styles.subtitle}>Detailed breakdown of your investment returns</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <SummaryCard
            title="Total Invested"
            value={results.totalInvested}
            icon={<DollarSign size={20} color="#3b82f6" />}
            color="#3b82f6"
          />
          <SummaryCard
            title="Maturity Value"
            value={results.maturityValue}
            icon={<TrendingUp size={20} color="#10b981" />}
            color="#10b981"
          />
          <SummaryCard
            title="Interest Earned"
            value={results.interestEarned}
            icon={<Percent size={20} color="#f59e0b" />}
            color="#f59e0b"
          />
        </View>

        {/* Visual Representation */}
        <View style={styles.visualContainer}>
          <View style={styles.visualHeader}>
            <PieChartIcon size={20} color="#3b82f6" />
            <Text style={styles.visualTitle}>Investment Breakdown</Text>
          </View>
          
          <View style={styles.chartContainer}>
            <PieChart data={pieChartData} size={180} strokeWidth={25} />
            
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
                <Text style={styles.legendText}>
                  Principal ({principalPercentage.toFixed(0)}%)
                </Text>
                <Text style={styles.legendValue}>
                  {formatCurrency(results.totalInvested)}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.legendText}>
                  Interest ({interestPercentage.toFixed(0)}%)
                </Text>
                <Text style={styles.legendValue}>
                  {formatCurrency(results.interestEarned)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <BarChart3 size={20} color="#3b82f6" />
            <Text style={styles.progressTitle}>Investment Analysis</Text>
          </View>
          
          <ProgressBar
            progress={principalPercentage}
            progressColor="#3b82f6"
            label="Principal Amount"
            showPercentage={true}
            height={12}
          />
          
          <ProgressBar
            progress={interestPercentage}
            progressColor="#10b981"
            label="Interest Earned"
            showPercentage={true}
            height={12}
          />
          
          <ProgressBar
            progress={parseFloat(returnPercentage)}
            progressColor="#f59e0b"
            label={`Return Rate (${returnPercentage}%)`}
            showPercentage={false}
            height={12}
          />
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>Key Metrics</Text>
          
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Return Rate</Text>
            <Text style={[styles.metricValue, { color: '#10b981' }]}>
              {returnPercentage}%
            </Text>
          </View>
          
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Total Return</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(results.interestEarned)}
            </Text>
          </View>
          
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Growth Multiple</Text>
            <Text style={[styles.metricValue, { color: '#3b82f6' }]}>
              {growthMultiple}x
            </Text>
          </View>
          
          {calculatorType === 'sip' && results.monthlyData && (
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Investment Period</Text>
              <Text style={styles.metricValue}>
                {results.monthlyData.length} months
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryCardTitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  summaryCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  visualContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  visualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  visualTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartLegend: {
    marginTop: 24,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  metricsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  metricLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});

export default ResultsDisplay;