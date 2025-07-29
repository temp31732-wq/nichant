// Tax calculation utilities for FD interest

export interface TaxCalculation {
  grossInterest: number;
  tdsDeducted: number;
  netInterest: number;
  taxableInterest: number;
  taxRate: number;
}

export const calculateFDTax = (
  interest: number, 
  taxSlab: number, 
  bankCategory: 'scheduled' | 'cooperative' = 'scheduled'
): TaxCalculation => {
  // TDS rates as per Indian tax rules
  const tdsThreshold = bankCategory === 'scheduled' ? 40000 : 50000;
  const tdsRate = 0.10; // 10% TDS
  
  let tdsDeducted = 0;
  if (interest > tdsThreshold) {
    tdsDeducted = interest * tdsRate;
  }
  
  const netInterest = interest - tdsDeducted;
  const taxableInterest = interest;
  
  return {
    grossInterest: interest,
    tdsDeducted: Math.round(tdsDeducted * 100) / 100,
    netInterest: Math.round(netInterest * 100) / 100,
    taxableInterest: Math.round(taxableInterest * 100) / 100,
    taxRate: taxSlab
  };
};

export const getTaxSlabs = () => [
  { label: '0% (No Tax)', value: 0 },
  { label: '5% (₹2.5L - ₹5L)', value: 5 },
  { label: '20% (₹5L - ₹10L)', value: 20 },
  { label: '30% (Above ₹10L)', value: 30 }
];

export const calculateStepUpSIP = (
  monthlyInvestment: number,
  expectedReturn: number,
  tenure: number,
  stepUpPercentage: number
): { totalInvested: number; maturityValue: number; interestEarned: number; monthlyData: any[] } => {
  const monthlyRate = expectedReturn / 12 / 100;
  let totalInvested = 0;
  let maturityValue = 0;
  const monthlyData = [];
  
  let currentMonthlyInvestment = monthlyInvestment;
  
  for (let month = 1; month <= tenure; month++) {
    // Step up investment every 12 months
    if (month > 1 && (month - 1) % 12 === 0) {
      currentMonthlyInvestment = currentMonthlyInvestment * (1 + stepUpPercentage / 100);
    }
    
    totalInvested += currentMonthlyInvestment;
    
    // Calculate maturity value for current month
    const remainingMonths = tenure - month + 1;
    const futureValueOfCurrentInvestment = currentMonthlyInvestment * Math.pow(1 + monthlyRate, remainingMonths - 1);
    maturityValue += futureValueOfCurrentInvestment;
    
    monthlyData.push({
      month,
      invested: Math.round(totalInvested * 100) / 100,
      maturity: Math.round(maturityValue * 100) / 100,
      interest: Math.round((maturityValue - totalInvested) * 100) / 100,
      monthlyInvestment: Math.round(currentMonthlyInvestment * 100) / 100
    });
  }
  
  return {
    totalInvested: Math.round(totalInvested * 100) / 100,
    maturityValue: Math.round(maturityValue * 100) / 100,
    interestEarned: Math.round((maturityValue - totalInvested) * 100) / 100,
    monthlyData
  };
};