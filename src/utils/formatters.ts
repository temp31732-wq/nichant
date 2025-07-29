// Utility functions for formatting numbers and text

export const formatCurrency = (amount: number, compact: boolean = false): string => {
  if (compact && amount >= 100000) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return Number(num).toFixed(decimals);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const getCompactAmount = (amount: number): { value: string; unit: string } => {
  if (amount >= 10000000) {
    return { value: (amount / 10000000).toFixed(1), unit: 'Cr' };
  } else if (amount >= 100000) {
    return { value: (amount / 100000).toFixed(1), unit: 'L' };
  } else if (amount >= 1000) {
    return { value: (amount / 1000).toFixed(1), unit: 'K' };
  }
  return { value: amount.toString(), unit: '' };
};