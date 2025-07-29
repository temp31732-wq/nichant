import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download, TrendingUp, DollarSign, Percent, FileText } from 'lucide-react';
import { CalculationResult } from './Calculator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResultsDisplayProps {
  results: CalculationResult | null;
  calculatorType: string;
  loading: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, calculatorType, loading }) => {
  const exportToPDF = async () => {
    const element = document.getElementById('results-container');
    if (!element || !results) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(40, 40, 40);
      pdf.text('Investment Calculator Report', 20, 20);
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      pdf.text(`Calculator Type: ${calculatorType.toUpperCase()}`, 20, 35);
      
      // Add summary
      pdf.setFontSize(14);
      pdf.setTextColor(40, 40, 40);
      pdf.text('Investment Summary:', 20, 50);
      
      pdf.setFontSize(11);
      pdf.text(`Total Invested: ₹${results.totalInvested.toLocaleString()}`, 20, 60);
      pdf.text(`Maturity Value: ₹${results.maturityValue.toLocaleString()}`, 20, 67);
      pdf.text(`Interest Earned: ₹${results.interestEarned.toLocaleString()}`, 20, 74);
      
      // Add chart
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 20, 85, imgWidth, imgHeight);
      
      pdf.save(`${calculatorType}-calculator-report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-strong bg-gradient-to-br from-card to-accent/5 border-0">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Calculating...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card className="shadow-strong bg-gradient-to-br from-card to-accent/5 border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Investment Results
          </CardTitle>
          <CardDescription>
            Enter your investment details and click calculate to see results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No calculations yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare pie chart data
  const pieData = [
    { name: 'Principal', value: results.totalInvested, color: '#3b82f6' },
    { name: 'Interest', value: results.interestEarned, color: '#10b981' }
  ];

  const COLORS = ['#3b82f6', '#10b981'];

  const getCalculatorTitle = () => {
    switch (calculatorType) {
      case 'fd': return 'Fixed Deposit';
      case 'rd': return 'Recurring Deposit';
      case 'sip': return 'SIP Investment';
      default: return 'Investment';
    }
  };

  return (
    <div id="results-container">
      <Card className="shadow-strong bg-gradient-to-br from-card to-accent/5 border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {getCalculatorTitle()} Results
              </CardTitle>
              <CardDescription>
                Detailed breakdown of your investment returns
              </CardDescription>
            </div>
            <Button
              onClick={exportToPDF}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Invested</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{results.totalInvested.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Maturity Value</p>
                      <p className="text-2xl font-bold text-success">
                        ₹{results.maturityValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 bg-success/10 rounded-full">
                      <TrendingUp className="w-5 h-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Earned</p>
                      <p className="text-2xl font-bold text-warning">
                        ₹{results.interestEarned.toLocaleString()}
                      </p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {((results.interestEarned / results.totalInvested) * 100).toFixed(1)}% gain
                      </Badge>
                    </div>
                    <div className="p-2 bg-warning/10 rounded-full">
                      <Percent className="w-5 h-5 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Separator />

          {/* Charts Section */}
          <div className="space-y-6">
            {/* Growth Chart */}
            {results.monthlyData && results.monthlyData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Investment Growth Over Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Track how your investment grows month by month
                  </p>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any, name: string) => [
                          `₹${Number(value).toLocaleString()}`, 
                          name === 'invested' ? 'Total Invested' : 
                          name === 'maturity' ? 'Maturity Value' : 'Interest Earned'
                        ]}
                        labelFormatter={(label) => `Month ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="invested" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        name="invested"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="maturity" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        name="maturity"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <div>
                <h3 className="text-lg font-semibold mb-2">Investment Breakdown</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Principal vs Interest composition
                </p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Key Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Return Rate</span>
                    <span className="font-semibold text-success">
                      {((results.interestEarned / results.totalInvested) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Total Return</span>
                    <span className="font-semibold">
                      ₹{results.interestEarned.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Growth Multiple</span>
                    <span className="font-semibold text-primary">
                      {(results.maturityValue / results.totalInvested).toFixed(2)}x
                    </span>
                  </div>
                  {calculatorType === 'sip' && results.monthlyData && (
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Investment Period</span>
                      <span className="font-semibold">
                        {results.monthlyData.length} months
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsDisplay;