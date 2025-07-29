# Smart Investment Calculator - React Native

A comprehensive investment calculator mobile app built with Expo and React Native. Calculate returns for Fixed Deposits (FD), Recurring Deposits (RD), and Systematic Investment Plans (SIP).

## Features

- **Fixed Deposit Calculator**: Calculate returns with simple or compound interest
- **Recurring Deposit Calculator**: Plan your monthly savings with RD calculations
- **SIP Calculator**: Systematic Investment Plan calculator for mutual funds
- **Responsive Design**: Optimized for mobile devices
- **Real-time Calculations**: Instant results as you input values
- **Detailed Results**: Comprehensive breakdown of investment returns

## Tech Stack

- **Expo SDK 53**: React Native framework
- **TypeScript**: Type-safe development
- **Lucide React Native**: Beautiful icons
- **React Native Reanimated**: Smooth animations
- **Expo Router**: File-based routing

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Expo CLI
- iOS Simulator or Android Emulator (optional)
- Expo Go app on your mobile device

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-investment-calculator-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on specific platforms:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Home screen
├── src/
│   ├── components/        # React components
│   │   ├── Calculator.tsx # Main calculator component
│   │   └── ResultsDisplay.tsx # Results display component
│   └── utils/            # Utility functions
│       └── formatters.ts # Number formatting utilities
├── assets/               # Static assets
└── app.json             # Expo configuration
```

## Features Overview

### Fixed Deposit Calculator
- Principal amount input
- Interest rate configuration
- Tenure selection
- Simple vs Compound interest options
- Compounding frequency selection

### Recurring Deposit Calculator
- Monthly deposit amount
- Interest rate input
- Tenure in months
- Automatic maturity calculation

### SIP Calculator
- Monthly investment amount
- Expected annual return
- Investment period
- Future value calculations

## Calculations

The app implements standard financial formulas:

- **Simple Interest**: `SI = P × R × T / 100`
- **Compound Interest**: `CI = P(1 + R/n)^(nt) - P`
- **RD Maturity**: `M = P × [((1 + r)^n - 1) / (1 - (1 + r)^(-1/3))]`
- **SIP Future Value**: `FV = P × ((1 + r)^n – 1) / r × (1 + r)`

Where:
- P = Principal/Monthly Investment
- R/r = Interest Rate
- T/t = Time Period
- n = Compounding Frequency

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@smartcalculator.com or create an issue in the repository.