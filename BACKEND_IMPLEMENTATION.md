# Smart Investment Calculator - Backend Implementation Guide

This document provides the complete Node.js/Express backend code that you can deploy separately to work with the frontend application.

## 📁 Project Structure
```
backend/
├── package.json
├── server.js
├── routes/
│   └── calculator.js
├── middleware/
│   └── validation.js
└── utils/
    └── calculations.js
```

## 📋 Dependencies (package.json)
```json
{
  "name": "smart-investment-calculator-backend",
  "version": "1.0.0",
  "description": "Backend API for Smart Investment Calculator",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "joi": "^17.9.2",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## 🚀 Main Server (server.js)
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const calculatorRoutes = require('./routes/calculator');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', calculatorRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Smart Investment Calculator API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Smart Investment Calculator API`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
```

## 🔍 Validation Middleware (middleware/validation.js)
```javascript
const Joi = require('joi');

const fdValidationSchema = Joi.object({
  principal: Joi.number().positive().max(10000000).required(),
  rate: Joi.number().min(0).max(50).required(),
  time: Joi.number().positive().max(50).required(),
  interestType: Joi.string().valid('simple', 'compound').required(),
  compoundingFrequency: Joi.number().valid(1, 2, 4, 12).when('interestType', {
    is: 'compound',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

const rdValidationSchema = Joi.object({
  monthlyDeposit: Joi.number().positive().max(1000000).required(),
  rate: Joi.number().min(0).max(50).required(),
  tenure: Joi.number().positive().max(600).required() // max 50 years
});

const sipValidationSchema = Joi.object({
  monthlyInvestment: Joi.number().positive().max(1000000).required(),
  expectedReturn: Joi.number().min(0).max(100).required(),
  tenure: Joi.number().positive().max(600).required() // max 50 years
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }
    next();
  };
};

module.exports = {
  validateFD: validateRequest(fdValidationSchema),
  validateRD: validateRequest(rdValidationSchema),
  validateSIP: validateRequest(sipValidationSchema)
};
```

## 🧮 Calculation Utils (utils/calculations.js)
```javascript
// Fixed Deposit Calculations
const calculateFD = (principal, rate, time, interestType, compoundingFrequency = 1) => {
  if (principal <= 0 || rate < 0 || time <= 0) {
    throw new Error('Invalid input parameters');
  }

  let maturity;
  
  if (interestType === 'simple') {
    maturity = principal + (principal * rate * time) / 100;
  } else {
    // Compound Interest: A = P(1 + r/n)^(nt)
    maturity = principal * Math.pow(1 + rate / (compoundingFrequency * 100), compoundingFrequency * time);
  }

  const interestEarned = maturity - principal;
  const monthlyData = generateFDMonthlyData(principal, rate, time, interestType, compoundingFrequency);

  return {
    totalInvested: Math.round(principal * 100) / 100,
    maturity: Math.round(maturity * 100) / 100,
    interestEarned: Math.round(interestEarned * 100) / 100,
    monthlyData
  };
};

// Recurring Deposit Calculations
const calculateRD = (monthlyDeposit, rate, tenure) => {
  if (monthlyDeposit <= 0 || rate < 0 || tenure <= 0) {
    throw new Error('Invalid input parameters');
  }

  const monthlyRate = rate / 12 / 100;
  const totalInvested = monthlyDeposit * tenure;
  
  // RD Formula: M = P × [((1 + r)^n - 1) / (1 - (1 + r)^(-1/3))]
  let maturity;
  if (rate === 0) {
    maturity = totalInvested;
  } else {
    maturity = monthlyDeposit * (Math.pow(1 + monthlyRate, tenure) - 1) / (1 - Math.pow(1 + monthlyRate, -1/3));
  }
  
  const interestEarned = maturity - totalInvested;
  const monthlyData = generateRDMonthlyData(monthlyDeposit, rate, tenure);

  return {
    totalInvested: Math.round(totalInvested * 100) / 100,
    maturity: Math.round(maturity * 100) / 100,
    interestEarned: Math.round(interestEarned * 100) / 100,
    monthlyData
  };
};

// SIP Calculations
const calculateSIP = (monthlyInvestment, expectedReturn, tenure) => {
  if (monthlyInvestment <= 0 || expectedReturn < 0 || tenure <= 0) {
    throw new Error('Invalid input parameters');
  }

  const monthlyRate = expectedReturn / 12 / 100;
  const totalInvested = monthlyInvestment * tenure;
  
  // SIP Formula: FV = P × ((1 + r)^n – 1) / r × (1 + r)
  let futureValue;
  if (expectedReturn === 0) {
    futureValue = totalInvested;
  } else {
    futureValue = monthlyInvestment * (Math.pow(1 + monthlyRate, tenure) - 1) / monthlyRate * (1 + monthlyRate);
  }
  
  const gains = futureValue - totalInvested;
  const monthlyData = generateSIPMonthlyData(monthlyInvestment, expectedReturn, tenure);

  return {
    totalInvested: Math.round(totalInvested * 100) / 100,
    maturity: Math.round(futureValue * 100) / 100,
    interestEarned: Math.round(gains * 100) / 100,
    monthlyData
  };
};

// Helper functions for monthly data generation
const generateFDMonthlyData = (principal, rate, time, interestType, compoundingFrequency) => {
  const monthlyData = [];
  const totalMonths = Math.floor(time * 12);
  
  for (let month = 1; month <= totalMonths; month++) {
    const timeInYears = month / 12;
    let monthlyMaturity;
    
    if (interestType === 'simple') {
      monthlyMaturity = principal + (principal * rate * timeInYears) / 100;
    } else {
      monthlyMaturity = principal * Math.pow(1 + rate / (compoundingFrequency * 100), compoundingFrequency * timeInYears);
    }
    
    monthlyData.push({
      month,
      invested: principal,
      maturity: Math.round(monthlyMaturity * 100) / 100,
      interest: Math.round((monthlyMaturity - principal) * 100) / 100,
    });
  }
  
  return monthlyData;
};

const generateRDMonthlyData = (monthlyDeposit, rate, tenure) => {
  const monthlyData = [];
  const monthlyRate = rate / 12 / 100;
  
  for (let month = 1; month <= tenure; month++) {
    const invested = monthlyDeposit * month;
    let monthlyMaturity;
    
    if (rate === 0) {
      monthlyMaturity = invested;
    } else {
      monthlyMaturity = monthlyDeposit * (Math.pow(1 + monthlyRate, month) - 1) / (1 - Math.pow(1 + monthlyRate, -1/3));
    }
    
    monthlyData.push({
      month,
      invested: Math.round(invested * 100) / 100,
      maturity: Math.round(monthlyMaturity * 100) / 100,
      interest: Math.round((monthlyMaturity - invested) * 100) / 100,
    });
  }
  
  return monthlyData;
};

const generateSIPMonthlyData = (monthlyInvestment, expectedReturn, tenure) => {
  const monthlyData = [];
  const monthlyRate = expectedReturn / 12 / 100;
  
  for (let month = 1; month <= tenure; month++) {
    const invested = monthlyInvestment * month;
    let monthlyFV;
    
    if (expectedReturn === 0) {
      monthlyFV = invested;
    } else {
      monthlyFV = monthlyInvestment * (Math.pow(1 + monthlyRate, month) - 1) / monthlyRate * (1 + monthlyRate);
    }
    
    monthlyData.push({
      month,
      invested: Math.round(invested * 100) / 100,
      maturity: Math.round(monthlyFV * 100) / 100,
      interest: Math.round((monthlyFV - invested) * 100) / 100,
    });
  }
  
  return monthlyData;
};

module.exports = {
  calculateFD,
  calculateRD,
  calculateSIP
};
```

## 🛣️ Routes (routes/calculator.js)
```javascript
const express = require('express');
const router = express.Router();
const { validateFD, validateRD, validateSIP } = require('../middleware/validation');
const { calculateFD, calculateRD, calculateSIP } = require('../utils/calculations');

// Fixed Deposit Calculator
router.post('/calculate-fd', validateFD, async (req, res) => {
  try {
    const { principal, rate, time, interestType, compoundingFrequency } = req.body;
    
    const result = calculateFD(principal, rate, time, interestType, compoundingFrequency);
    
    res.json({
      success: true,
      data: {
        totalInvested: result.totalInvested,
        maturityValue: result.maturity,
        interestEarned: result.interestEarned,
        monthlyData: result.monthlyData,
        calculationType: 'Fixed Deposit',
        parameters: {
          principal,
          rate,
          time,
          interestType,
          compoundingFrequency: interestType === 'compound' ? compoundingFrequency : null
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('FD Calculation Error:', error);
    res.status(400).json({
      success: false,
      error: 'Calculation Error',
      message: error.message
    });
  }
});

// Recurring Deposit Calculator
router.post('/calculate-rd', validateRD, async (req, res) => {
  try {
    const { monthlyDeposit, rate, tenure } = req.body;
    
    const result = calculateRD(monthlyDeposit, rate, tenure);
    
    res.json({
      success: true,
      data: {
        totalInvested: result.totalInvested,
        maturityValue: result.maturity,
        interestEarned: result.interestEarned,
        monthlyData: result.monthlyData,
        calculationType: 'Recurring Deposit',
        parameters: {
          monthlyDeposit,
          rate,
          tenure
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('RD Calculation Error:', error);
    res.status(400).json({
      success: false,
      error: 'Calculation Error',
      message: error.message
    });
  }
});

// SIP Calculator
router.post('/calculate-sip', validateSIP, async (req, res) => {
  try {
    const { monthlyInvestment, expectedReturn, tenure } = req.body;
    
    const result = calculateSIP(monthlyInvestment, expectedReturn, tenure);
    
    res.json({
      success: true,
      data: {
        totalInvested: result.totalInvested,
        maturityValue: result.maturity,
        interestEarned: result.interestEarned,
        monthlyData: result.monthlyData,
        calculationType: 'SIP',
        parameters: {
          monthlyInvestment,
          expectedReturn,
          tenure
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('SIP Calculation Error:', error);
    res.status(400).json({
      success: false,
      error: 'Calculation Error',
      message: error.message
    });
  }
});

module.exports = router;
```

## 📡 API Documentation

### Base URL
```
https://your-backend-domain.com/api
```

### Endpoints

#### 1. Fixed Deposit Calculator
**POST** `/calculate-fd`

**Request Body:**
```json
{
  "principal": 100000,
  "rate": 7.5,
  "time": 3,
  "interestType": "compound",
  "compoundingFrequency": 4
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalInvested": 100000,
    "maturityValue": 124059.98,
    "interestEarned": 24059.98,
    "monthlyData": [...],
    "calculationType": "Fixed Deposit",
    "parameters": {...}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Recurring Deposit Calculator
**POST** `/calculate-rd`

**Request Body:**
```json
{
  "monthlyDeposit": 5000,
  "rate": 7.0,
  "tenure": 24
}
```

#### 3. SIP Calculator
**POST** `/calculate-sip`

**Request Body:**
```json
{
  "monthlyInvestment": 5000,
  "expectedReturn": 12,
  "tenure": 60
}
```

## 🚀 Deployment Instructions

### For Render.com:
1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-frontend-domain.com`

### For Railway:
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Deploy: `railway init` → `railway up`

### For Vercel:
1. Install Vercel CLI: `npm install -g vercel`
2. Deploy: `vercel`

### For Heroku:
1. Install Heroku CLI
2. Create app: `heroku create your-app-name`
3. Deploy: `git push heroku main`

## 🔧 Environment Variables
```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
```

## 🧪 Testing the API

### Using curl:
```bash
# Test FD Calculator
curl -X POST https://your-api-domain.com/api/calculate-fd \
  -H "Content-Type: application/json" \
  -d '{
    "principal": 100000,
    "rate": 7.5,
    "time": 3,
    "interestType": "compound",
    "compoundingFrequency": 4
  }'
```

### Using Postman:
Import the provided API endpoints and test with sample data.

## 📊 Features Implemented
✅ FD Calculator (Simple & Compound Interest)  
✅ RD Calculator  
✅ SIP Calculator  
✅ Input Validation  
✅ Error Handling  
✅ Monthly Data Generation  
✅ CORS Support  
✅ Security Headers  
✅ Request Logging  
✅ Health Check Endpoint  

## 🔐 Security Features
- Helmet.js for security headers
- CORS configuration
- Input validation with Joi
- Request size limits
- Error handling without exposing internals

Deploy this backend and update your frontend to use the API endpoints instead of client-side calculations!