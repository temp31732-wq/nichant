import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { TrendingUp, DollarSign, Percent } from 'lucide-react-native';
import { CalculationResult } from './Calculator';
import { formatCurrency } from '../utils/formatters';

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
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <View style={styles.summaryCardHeader}>
        <Text style={styles.summaryCardTitle}>{title}</Text>
        <View style={[styles.summaryCardIcon, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
      </View>
      <Text style={[styles.summaryCardValue, { color }]}>
        {formatCurrency(value)}
      </Text>
    </View>
  );

  const returnPercentage = ((results.interestEarned / results.totalInvested) * 100).toFixed(2);
  const growthMultiple = (results.maturityValue / results.totalInvested).toFixed(2);

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

        {/* Investment Breakdown */}
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Investment Breakdown</Text>
          
          <View style={styles.pieChartContainer}>
            <View style={styles.pieChartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#3b82f6' }]} />
                <Text style={styles.legendText}>
                  Principal: {((results.totalInvested / results.maturityValue) * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
                <Text style={styles.legendText}>
                  Interest: {((results.interestEarned / results.maturityValue) * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>
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
  metricsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  metricLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  breakdownContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  pieChartLegend: {
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default ResultsDisplay;