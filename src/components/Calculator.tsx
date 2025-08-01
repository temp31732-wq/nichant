import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { Calculator as CalculatorIcon, TrendingUp, PiggyBank, Repeat } from 'lucide-react-native';
import ResultsDisplay from './ResultsDisplay';
import { formatCurrency } from '../utils/formatters';

const { width } = Dimensions.get('window');

export interface CalculationResult {
  totalInvested: number;
  maturityValue: number;
  interestEarned: number;
  monthlyData?: Array<{
    month: number;
    invested: number;
    maturity: number;
    interest: number;
    monthlyInvestment?: number;
  }>;
}

const Calculator = () => {
  const [activeTab, setActiveTab] = useState('fd');
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // FD States
  const [fdPrincipal, setFdPrincipal] = useState('100000');
  const [fdRate, setFdRate] = useState('7.5');
  const [fdTenure, setFdTenure] = useState('3');
  const [fdInterestType, setFdInterestType] = useState('compound');
  const [fdCompoundingFreq, setFdCompoundingFreq] = useState('4');

  // RD States
  const [rdMonthlyDeposit, setRdMonthlyDeposit] = useState('5000');
  const [rdRate, setRdRate] = useState('7.0');
  const [rdTenure, setRdTenure] = useState('24');

  // SIP States
  const [sipMonthlyInvestment, setSipMonthlyInvestment] = useState('5000');
  const [sipExpectedReturn, setSipExpectedReturn] = useState('12');
  const [sipTenure, setSipTenure] = useState('60');

  const calculateFD = () => {
    const principal = parseFloat(fdPrincipal);
    const rate = parseFloat(fdRate);
    const time = parseFloat(fdTenure);
    const frequency = parseInt(fdCompoundingFreq);

    if (principal <= 0 || rate < 0 || time <= 0) {
      return null;
    }

    let maturity: number;
    
    if (fdInterestType === 'simple') {
      maturity = principal + (principal * rate * time) / 100;
    } else {
      maturity = principal * Math.pow(1 + rate / (frequency * 100), frequency * time);
    }

    const interestEarned = maturity - principal;

    // Generate monthly data for visualization
    const monthlyData = [];
    const totalMonths = Math.floor(time * 12);
    
    for (let month = 1; month <= totalMonths; month++) {
      const timeInYears = month / 12;
      let monthlyMaturity: number;
      
      if (fdInterestType === 'simple') {
        monthlyMaturity = principal + (principal * rate * timeInYears) / 100;
      } else {
        monthlyMaturity = principal * Math.pow(1 + rate / (frequency * 100), frequency * timeInYears);
      }
      
      monthlyData.push({
        month,
        invested: principal,
        maturity: Math.round(monthlyMaturity * 100) / 100,
        interest: Math.round((monthlyMaturity - principal) * 100) / 100,
      });
    }

    return {
      totalInvested: principal,
      maturityValue: Math.round(maturity * 100) / 100,
      interestEarned: Math.round(interestEarned * 100) / 100,
      monthlyData,
    };
  };

  const calculateRD = () => {
    const monthlyDeposit = parseFloat(rdMonthlyDeposit);
    const annualRate = parseFloat(rdRate);
    const tenure = parseInt(rdTenure);

    if (monthlyDeposit <= 0 || annualRate < 0 || tenure <= 0) {
      return null;
    }

    const monthlyRate = annualRate / 12 / 100;
    const totalInvested = monthlyDeposit * tenure;
    
    // RD Formula: M = P × [((1 + r)^n - 1) / (1 - (1 + r)^(-1/3))]
    const maturity = monthlyDeposit * (Math.pow(1 + monthlyRate, tenure) - 1) / (1 - Math.pow(1 + monthlyRate, -1/3));
    const interestEarned = maturity - totalInvested;

    // Generate monthly data
    const monthlyData = [];
    for (let month = 1; month <= tenure; month++) {
      const invested = monthlyDeposit * month;
      const monthlyMaturity = monthlyDeposit * (Math.pow(1 + monthlyRate, month) - 1) / (1 - Math.pow(1 + monthlyRate, -1/3));
      
      monthlyData.push({
        month,
        invested: Math.round(invested * 100) / 100,
        maturity: Math.round(monthlyMaturity * 100) / 100,
        interest: Math.round((monthlyMaturity - invested) * 100) / 100,
      });
    }

    return {
      totalInvested: Math.round(totalInvested * 100) / 100,
      maturityValue: Math.round(maturity * 100) / 100,
      interestEarned: Math.round(interestEarned * 100) / 100,
      monthlyData,
    };
  };

  const calculateSIP = () => {
    const monthlyInvestment = parseFloat(sipMonthlyInvestment);
    const expectedReturn = parseFloat(sipExpectedReturn);
    const tenure = parseInt(sipTenure);

    if (monthlyInvestment <= 0 || expectedReturn < 0 || tenure <= 0) {
      return null;
    }

    const monthlyRate = expectedReturn / 12 / 100;
    const totalInvested = monthlyInvestment * tenure;
    
    // SIP Formula: FV = P × ((1 + r)^n – 1) / r × (1 + r)
    const futureValue = monthlyInvestment * (Math.pow(1 + monthlyRate, tenure) - 1) / monthlyRate * (1 + monthlyRate);
    const gains = futureValue - totalInvested;

    // Generate monthly data
    const monthlyData = [];
    for (let month = 1; month <= tenure; month++) {
      const invested = monthlyInvestment * month;
      const monthlyFV = monthlyInvestment * (Math.pow(1 + monthlyRate, month) - 1) / monthlyRate * (1 + monthlyRate);
      
      monthlyData.push({
        month,
        invested: Math.round(invested * 100) / 100,
        maturity: Math.round(monthlyFV * 100) / 100,
        interest: Math.round((monthlyFV - invested) * 100) / 100,
      });
    }

    return {
      totalInvested: Math.round(totalInvested * 100) / 100,
      maturityValue: Math.round(futureValue * 100) / 100,
      interestEarned: Math.round(gains * 100) / 100,
      monthlyData,
    };
  };

  const handleCalculate = async () => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let result: CalculationResult | null = null;
    
    try {
      switch (activeTab) {
        case 'fd':
          result = calculateFD();
          break;
        case 'rd':
          result = calculateRD();
          break;
        case 'sip':
          result = calculateSIP();
          break;
      }
      
      if (!result) {
        Alert.alert('Error', 'Please check your input values');
        return;
      }
      
      setResults(result);
    } catch (error) {
      Alert.alert('Error', 'An error occurred during calculation');
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, icon, isActive, onPress }: any) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'numeric' }: any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#9ca3af"
      />
    </View>
  );

  const PickerField = ({ label, value, options, onValueChange }: any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.pickerContainer}>
        {options.map((option: any) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.pickerOption,
              value === option.value && styles.activePickerOption
            ]}
            onPress={() => onValueChange(option.value)}
          >
            <Text style={[
              styles.pickerOptionText,
              value === option.value && styles.activePickerOptionText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <CalculatorIcon size={32} color="#ffffff" />
        </View>
        <Text style={styles.headerTitle}>Smart Investment Calculator</Text>
        <Text style={styles.headerSubtitle}>
          Calculate returns for Fixed Deposits, Recurring Deposits, and SIP investments
        </Text>
      </View>

      <View style={styles.content}>
        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TabButton
            id="fd"
            label="FD"
            icon={<PiggyBank size={20} color={activeTab === 'fd' ? '#ffffff' : '#6b7280'} />}
            isActive={activeTab === 'fd'}
            onPress={() => setActiveTab('fd')}
          />
          <TabButton
            id="rd"
            label="RD"
            icon={<Repeat size={20} color={activeTab === 'rd' ? '#ffffff' : '#6b7280'} />}
            isActive={activeTab === 'rd'}
            onPress={() => setActiveTab('rd')}
          />
          <TabButton
            id="sip"
            label="SIP"
            icon={<TrendingUp size={20} color={activeTab === 'sip' ? '#ffffff' : '#6b7280'} />}
            isActive={activeTab === 'sip'}
            onPress={() => setActiveTab('sip')}
          />
        </View>

        {/* Input Forms */}
        <View style={styles.formContainer}>
          {activeTab === 'fd' && (
            <View>
              <InputField
                label="Principal Amount (₹)"
                value={fdPrincipal}
                onChangeText={setFdPrincipal}
                placeholder="Enter principal amount"
              />
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Interest Rate (%)"
                    value={fdRate}
                    onChangeText={setFdRate}
                    placeholder="Rate"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Tenure (Years)"
                    value={fdTenure}
                    onChangeText={setFdTenure}
                    placeholder="Years"
                  />
                </View>
              </View>
              <PickerField
                label="Interest Type"
                value={fdInterestType}
                options={[
                  { label: 'Simple', value: 'simple' },
                  { label: 'Compound', value: 'compound' }
                ]}
                onValueChange={setFdInterestType}
              />
              {fdInterestType === 'compound' && (
                <PickerField
                  label="Compounding Frequency"
                  value={fdCompoundingFreq}
                  options={[
                    { label: 'Annually', value: '1' },
                    { label: 'Half-yearly', value: '2' },
                    { label: 'Quarterly', value: '4' },
                    { label: 'Monthly', value: '12' }
                  ]}
                  onValueChange={setFdCompoundingFreq}
                />
              )}
            </View>
          )}

          {activeTab === 'rd' && (
            <View>
              <InputField
                label="Monthly Deposit (₹)"
                value={rdMonthlyDeposit}
                onChangeText={setRdMonthlyDeposit}
                placeholder="Enter monthly deposit"
              />
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Interest Rate (% p.a.)"
                    value={rdRate}
                    onChangeText={setRdRate}
                    placeholder="Rate"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Tenure (Months)"
                    value={rdTenure}
                    onChangeText={setRdTenure}
                    placeholder="Months"
                  />
                </View>
              </View>
            </View>
          )}

          {activeTab === 'sip' && (
            <View>
              <InputField
                label="Monthly Investment (₹)"
                value={sipMonthlyInvestment}
                onChangeText={setSipMonthlyInvestment}
                placeholder="Enter monthly investment"
              />
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Expected Return (% p.a.)"
                    value={sipExpectedReturn}
                    onChangeText={setSipExpectedReturn}
                    placeholder="Return"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <InputField
                    label="Investment Period (Months)"
                    value={sipTenure}
                    onChangeText={setSipTenure}
                    placeholder="Months"
                  />
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.calculateButton, loading && styles.disabledButton]}
            onPress={handleCalculate}
            disabled={loading}
          >
            <Text style={styles.calculateButtonText}>
              {loading ? 'Calculating...' : 'Calculate Returns'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <ResultsDisplay 
          results={results} 
          calculatorType={activeTab}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  content: {
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabButtonText: {
    color: '#ffffff',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  'textInput:focus': {
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pickerOption: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  activePickerOption: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerOptionText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  activePickerOptionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  calculateButton: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  calculateButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});

export default Calculator;