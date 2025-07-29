import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Euro, PoundSterling } from 'lucide-react';

interface Currency {
  code: string;
  symbol: string;
  name: string;
  icon: React.ReactNode;
  rate: number; // Rate relative to INR
}

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  className?: string;
}

const currencies: Currency[] = [
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    icon: <span className="text-orange-500 font-bold">₹</span>,
    rate: 1
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    icon: <DollarSign className="w-4 h-4 text-green-600" />,
    rate: 83.12
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    icon: <Euro className="w-4 h-4 text-blue-600" />,
    rate: 90.25
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    icon: <PoundSterling className="w-4 h-4 text-purple-600" />,
    rate: 105.48
  }
];

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ 
  selectedCurrency, 
  onCurrencyChange, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency) || currencies[0];

  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
        {selectedCurrencyData.icon}
        <span className="text-xs font-medium">Currency</span>
      </Badge>
      
      <Select 
        value={selectedCurrency} 
        onValueChange={onCurrencyChange}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger className="w-40 h-9 bg-white/50 backdrop-blur-sm border-border/50">
          <SelectValue>
            <div className="flex items-center gap-2">
              {selectedCurrencyData.icon}
              <span className="font-medium">{selectedCurrencyData.code}</span>
              <span className="text-muted-foreground text-xs">
                {selectedCurrencyData.name}
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent className="bg-white/95 backdrop-blur-md border-border/50">
          {currencies.map((currency) => (
            <SelectItem 
              key={currency.code} 
              value={currency.code}
              className="flex items-center gap-2 cursor-pointer hover:bg-muted/50"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center gap-2">
                  {currency.icon}
                  <span className="font-medium">{currency.code}</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm">{currency.name}</div>
                  {currency.code !== 'INR' && (
                    <div className="text-xs text-muted-foreground">
                      1 {currency.code} = ₹{currency.rate}
                    </div>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Live conversion indicator */}
      <motion.div
        className="flex items-center gap-1"
        animate={{ scale: isOpen ? 1.05 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-muted-foreground">Live</span>
      </motion.div>
    </motion.div>
  );
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  const fromRate = currencies.find(c => c.code === fromCurrency)?.rate || 1;
  const toRate = currencies.find(c => c.code === toCurrency)?.rate || 1;
  
  // Convert to INR first, then to target currency
  const inrAmount = amount / fromRate;
  const convertedAmount = inrAmount * toRate;
  
  return Math.round(convertedAmount * 100) / 100;
};

export const getCurrencySymbol = (currencyCode: string): string => {
  return currencies.find(c => c.code === currencyCode)?.symbol || '₹';
};

export default CurrencySelector;