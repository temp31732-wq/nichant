import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ResultsDisplay from './ResultsDisplay';
import { Calculator as CalculatorIcon, TrendingUp, PiggyBank, Repeat } from 'lucide-react';

export interface CalculationResult {
  totalInvested: number;
  maturityValue: number;
  interestEarned: number;
  monthlyData?: Array<{
    month: number;
    invested: number;
    maturity: number;
    interest: number;
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
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let result: CalculationResult | null = null;
    
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
    
    setResults(result);
    setLoading(false);
  };

  const tabConfigs = [
    {
      value: 'fd',
      label: 'Fixed Deposit',
      icon: <PiggyBank className="w-4 h-4" />,
      description: 'Calculate returns on your Fixed Deposit investment'
    },
    {
      value: 'rd',
      label: 'Recurring Deposit',
      icon: <Repeat className="w-4 h-4" />,
      description: 'Plan your monthly savings with RD calculator'
    },
    {
      value: 'sip',
      label: 'SIP Calculator',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Systematic Investment Plan calculator for mutual funds'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/5 to-accent/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-lg">
              <CalculatorIcon className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent mb-2">
            Smart Investment Calculator
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Calculate returns for Fixed Deposits, Recurring Deposits, and SIP investments with detailed insights and charts
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Calculator Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-strong bg-gradient-to-br from-card to-accent/5 border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <CalculatorIcon className="w-5 h-5 text-primary" />
                  Investment Calculator
                </CardTitle>
                <CardDescription>
                  Choose your investment type and enter the details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    {tabConfigs.map((tab) => (
                      <TabsTrigger 
                        key={tab.value} 
                        value={tab.value}
                        className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.value.toUpperCase()}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Fixed Deposit */}
                  <TabsContent value="fd" className="space-y-4">
                    <div className="mb-4">
                      <Badge variant="outline" className="mb-2">
                        {tabConfigs.find(t => t.value === 'fd')?.description}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="fd-principal">Principal Amount (₹)</Label>
                        <Input
                          id="fd-principal"
                          type="number"
                          value={fdPrincipal}
                          onChange={(e) => setFdPrincipal(e.target.value)}
                          placeholder="Enter principal amount"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="fd-rate">Interest Rate (%)</Label>
                        <Input
                          id="fd-rate"
                          type="number"
                          step="0.1"
                          value={fdRate}
                          onChange={(e) => setFdRate(e.target.value)}
                          placeholder="Enter interest rate"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="fd-tenure">Tenure (Years)</Label>
                        <Input
                          id="fd-tenure"
                          type="number"
                          value={fdTenure}
                          onChange={(e) => setFdTenure(e.target.value)}
                          placeholder="Enter tenure"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="fd-type">Interest Type</Label>
                        <Select value={fdInterestType} onValueChange={setFdInterestType}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select interest type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="simple">Simple Interest</SelectItem>
                            <SelectItem value="compound">Compound Interest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {fdInterestType === 'compound' && (
                        <div>
                          <Label htmlFor="fd-frequency">Compounding Frequency</Label>
                          <Select value={fdCompoundingFreq} onValueChange={setFdCompoundingFreq}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Annually</SelectItem>
                              <SelectItem value="2">Half-yearly</SelectItem>
                              <SelectItem value="4">Quarterly</SelectItem>
                              <SelectItem value="12">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Recurring Deposit */}
                  <TabsContent value="rd" className="space-y-4">
                    <div className="mb-4">
                      <Badge variant="outline" className="mb-2">
                        {tabConfigs.find(t => t.value === 'rd')?.description}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="rd-monthly">Monthly Deposit (₹)</Label>
                        <Input
                          id="rd-monthly"
                          type="number"
                          value={rdMonthlyDeposit}
                          onChange={(e) => setRdMonthlyDeposit(e.target.value)}
                          placeholder="Enter monthly deposit"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="rd-rate">Interest Rate (% per annum)</Label>
                        <Input
                          id="rd-rate"
                          type="number"
                          step="0.1"
                          value={rdRate}
                          onChange={(e) => setRdRate(e.target.value)}
                          placeholder="Enter interest rate"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="rd-tenure">Tenure (Months)</Label>
                        <Input
                          id="rd-tenure"
                          type="number"
                          value={rdTenure}
                          onChange={(e) => setRdTenure(e.target.value)}
                          placeholder="Enter tenure in months"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* SIP Calculator */}
                  <TabsContent value="sip" className="space-y-4">
                    <div className="mb-4">
                      <Badge variant="outline" className="mb-2">
                        {tabConfigs.find(t => t.value === 'sip')?.description}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="sip-monthly">Monthly Investment (₹)</Label>
                        <Input
                          id="sip-monthly"
                          type="number"
                          value={sipMonthlyInvestment}
                          onChange={(e) => setSipMonthlyInvestment(e.target.value)}
                          placeholder="Enter monthly investment"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="sip-return">Expected Annual Return (%)</Label>
                        <Input
                          id="sip-return"
                          type="number"
                          step="0.1"
                          value={sipExpectedReturn}
                          onChange={(e) => setSipExpectedReturn(e.target.value)}
                          placeholder="Enter expected return"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="sip-tenure">Investment Period (Months)</Label>
                        <Input
                          id="sip-tenure"
                          type="number"
                          value={sipTenure}
                          onChange={(e) => setSipTenure(e.target.value)}
                          placeholder="Enter investment period"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="w-full mt-6"
                  variant="paypal"
                  size="lg"
                >
                  {loading ? 'Calculating...' : 'Calculate Returns'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ResultsDisplay 
              results={results} 
              calculatorType={activeTab}
              loading={loading}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;