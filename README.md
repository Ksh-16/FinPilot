# 💰 FinPilot — Your Financial Co-Pilot

> **Plan better. Spend smarter. Invest with confidence.**

FinPilot is a full-stack personal finance platform designed especially for Indian users.

It combines financial health analysis, expense tracking, goal planning, future-cost simulation, investment planning, portfolio tracking, Indian stock-market data, and personalized financial insights into one unified platform.

The goal of FinPilot is simple:

> **Turn financial data into actionable decisions.**

---

## 🚀 Live Demo

### 🌐 Frontend
https://fin-pilot-full-stack-website.vercel.app/

### ⚙️ Backend
https://finpilot-backend-sd6y.onrender.com

### 💻 GitHub
https://github.com/KhC13/FinPilot--Full-Stack-Website

---

# ✨ Features

## 📊 Financial Health Score

FinPilot evaluates a user's financial health using:

- Monthly Income
- Monthly Expenses
- Savings
- Debt

It provides:

- Overall Financial Health Score
- Savings Rate
- Expense Ratio
- Debt-to-Income Ratio
- Emergency Fund Cushion
- Financial recommendations

This gives users a quick understanding of their current financial position.

---

## 🔮 What-If Simulator

Users can simulate financial decisions before actually making them.

They can explore scenarios such as:

- Increasing income
- Reducing expenses
- Increasing savings
- Paying off debt

The simulator shows how these changes can affect the user's financial health.

### Example

```text
Current Situation
       ↓
Change Income / Expenses / Savings / Debt
       ↓
Simulated Financial Situation
       ↓
Updated Financial Health

```
## 📈 Future Cost Simulator

Inflation can significantly increase the amount required for a future goal.

FinPilot allows users to enter:

-  Current Cost 
-  Number of Years 
-  Expected Inflation Rate 

and calculates the estimated future cost.

### Formula

```
```

```
Future Cost = Current Cost × (1 + Inflation Rate)^Years
```

This helps users understand how much they may actually need in the future.

---

## 💸 Expense Tracking

Users can track their day-to-day expenses.

Each expense can contain:

-  Title 
-  Amount 
-  Category 
-  Date 
-  Notes 

Supported functionality includes:

-  Add expense 
-  View expenses 
-  Delete expense 
-  Monthly filtering 
-  Year filtering 
-  Category filtering 
-  Total expense calculation 
-  Category-wise expense analysis 

---

## 🎯 Financial Goals

Users can create and manage financial goals.

Examples:

-  Emergency Fund 
-  Education 
-  Vacation 
-  Car 
-  Home 
-  Retirement 
-  Major Purchases 

Goals are linked to authenticated users so that each user has their own personalized financial data.

---

## 💰 Micro-Investment Engine

FinPilot helps users turn financial goals into an actionable investment plan.

Users can provide:

-  Goal Amount 
-  Investment Duration 
-  Expected Return 
-  Monthly Expense Transactions 
-  Average Round-Off Amount 

FinPilot calculates:

-  Daily Investment 
-  Monthly Investment 
-  Monthly Round-Off Savings 
-  Yearly Round-Off Savings 
-  Total Monthly Contribution 
-  Investment Growth Projection 

The idea is to make investing more achievable by breaking large financial goals into smaller contributions.

---

## 📊 Investment Portfolio Tracking

Authenticated users can track their investments through the FinPilot dashboard.

The portfolio system supports tracking information such as:

-  Investment name 
-  Quantity 
-  Purchase price 
-  Current value 
-  Returns 

Users can maintain a consolidated view of their investments instead of managing them across multiple platforms.

---

## 🔎 Indian Stock Search

FinPilot provides a searchable market selector for Indian securities.

Users can search for stocks such as:

```
```

```
TCS
RELIANCE
INFY
HDFCBANK
ICICIBANK
SBIN
ITC
```

The market search system supports Indian NSE/BSE securities and ETFs through the market-data layer.

---

## 📉 Interactive Market Charts

Users can search for a stock and view its historical price movement.

Supported ranges:

```
```

```
1D
1W
1M
6M
1Y
```

The chart dynamically changes according to the selected stock and time period.

---

## 🌐 Indian Market Overview

FinPilot provides market information for major Indian indices including:

-  NIFTY 50 
-  SENSEX 
-  NIFTY Bank 

This gives users a quick overview of the broader Indian market.

---

## 🧠 Smart Financial Insights

FinPilot generates personalized financial insights based on the user's financial data.

The system analyzes:

-  Income 
-  Expenses 
-  Savings 
-  Debt 

and generates structured insights based on the user's financial situation.

Each insight can contain:

-  Type 
-  Severity 
-  Title 
-  Message 

The current insight engine is rule-based, making recommendations transparent and predictable.

---

## 📄 Downloadable Financial Report

FinPilot provides a downloadable financial report containing the user's financial analysis.

The report can include:

-  Financial Health Score 
-  Financial metrics 
-  Future-cost projections 
-  Investment planning 
-  Financial insights 

This allows users to keep a portable summary of their financial situation.

---

# 🔐 Authentication

FinPilot uses JWT-based authentication.

Users can:

-  Register 
-  Login 
-  Logout 
-  Access their profile 
-  Access protected financial data 

Authentication tokens are stored using:

```
```

```
fp_token
```

Authenticated requests use:

```
```

```
Authorization: Bearer <JWT_TOKEN>
```

Protected user-specific features include:

-  Expenses 
-  Goals 
-  Portfolio 
-  Personalized financial data 

---

# 🏗️ System Architecture

```
```

```
                         ┌───────────────┐
                         │     USER      │
                         └───────┬───────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │    Next.js Frontend    │
                    │                        │
                    │ • Financial Score      │
                    │ • What-If Simulator    │
                    │ • Future Cost          │
                    │ • Expenses             │
                    │ • Goals                │
                    │ • Investments          │
                    │ • Portfolio             │
                    │ • Market Charts         │
                    │ • Smart Insights        │
                    └───────────┬────────────┘
                                │
                            REST APIs
                                │
                                ▼
                    ┌────────────────────────┐
                    │    Express Backend     │
                    │                        │
                    │ • Authentication       │
                    │ • Score APIs            │
                    │ • Goal APIs             │
                    │ • Portfolio APIs        │
                    │ • Investment APIs       │
                    │ • Market APIs           │
                    │ • Insight APIs          │
                    └───────────┬────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
          ┌──────────────────┐    ┌──────────────────┐
          │  MongoDB Atlas   │    │   Market Data    │
          │                  │    │                  │
          │ • Users          │    │ Yahoo Finance    │
          │ • Expenses       │    │ yfinance          │
          │ • Goals          │    │                  │
          │ • Portfolio      │    │ Indian Markets   │
          └──────────────────┘    └──────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

-  Next.js 
-  React 
-  TypeScript 
-  Tailwind CSS 
-  Recharts 
-  Lucide React 
-  Next.js App Router 

## Backend

-  Node.js 
-  Express.js 
-  JavaScript 
-  REST APIs 
-  JWT Authentication 

## Database

-  MongoDB 
-  MongoDB Atlas 

## Market Data

-  Python 
-  yfinance 
-  Yahoo Finance-compatible market data 
-  Requests 

## Deployment

-  Vercel 
-  Render 
-  MongoDB Atlas 

---

# 🎨 UI & Design

FinPilot follows a modern glassmorphism-inspired financial dashboard design.

### Design characteristics

-  Dark financial dashboard 
-  Glass cards 
-  Gradient accents 
-  Rounded components 
-  Subtle shadows 
-  Responsive layouts 
-  Interactive charts 
-  Financial score visualization 
-  Clean typography 

The interface is designed to make complex financial information easier to understand.

---

# 📁 Project Structure

```
```

```
FinPilot--Full-Stack-Website/
│
├── backend/
│   │
│   ├── controllers/
│   │   ├── marketController.js
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── goalRoutes.js
│   │   ├── portfolioRoutes.js
│   │   ├── marketRoutes.js
│   │   ├── score.js
│   │   └── ...
│   │
│   ├── middleware/
│   │
│   ├── models/
│   │
│   ├── market.py
│   ├── server.js
│   ├── package.json
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   ├── score/
│   │   ├── goals/
│   │   ├── expenses/
│   │   ├── investment/
│   │   └── ...
│   │
│   ├── components/
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   └── authApi.ts
│   │
│   ├── public/
│   │
│   ├── package.json
│   └── ...
│
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the repository

```
```

```
git clone https://github.com/KhC13/FinPilot--Full-Stack-Website.git
```

```
```

```
cd FinPilot--Full-Stack-Website
```

---

# 🖥️ Frontend Setup

Go to the frontend:

```
```

```
cd frontend
```

Install dependencies:

```
```

```
npm install
```

Create:

```
```

```
.env.local
```

Add:

```
```

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```
```

```
npm run dev
```

Frontend will run on:

```
```

```
http://localhost:3000
```

---

# ⚙️ Backend Setup

Open another terminal.

Go to:

```
```

```
cd backend
```

Install dependencies:

```
```

```
npm install
```

Create:

```
```

```
.env
```

Add:

```
```

```
PORT=5000
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```
```

```
node server.js
```

Backend will run on:

```
```

```
http://localhost:5000
```

---

# 📈 Market Data Setup

Install Python dependencies:

```
```

```
pip install -r requirements.txt
```

Required packages:

```
```

```
yfinance
requests
```

The market-data layer is used for stock search, historical prices, and market information.

---

# 🔑 Environment Variables

## Frontend — Development

```
```

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Frontend — Production

```
```

```
NEXT_PUBLIC_API_URL=https://finpilot-backend-sd6y.onrender.com/api
```

## Backend

```
```

```
PORT=5000
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Never commit environment files or API secrets to GitHub.

Recommended `.gitignore`:

```
```

```
.env
.env.local
node_modules/
.next/
```

---

# 🔌 API Endpoints

All APIs are available under:

```
```

```
/api
```

---

## 🔐 Authentication

### Register

```
```

```
POST /api/auth/register
```

### Login

```
```

```
POST /api/auth/login
```

### Current User

```
```

```
GET /api/auth/me
```

Protected requests require:

```
```

```
Authorization: Bearer <token>
```

---

## 📊 Financial Score

```
```

```
POST /api/score
```

Example:

```
```

```
{
  "income": 80000,
  "expenses": 45000,
  "savings": 25000,
  "debt": 10000
}
```

---

## 🔮 Future Cost

```
```

```
POST /api/future-cost
```

Example:

```
```

```
{
  "cost": 100000,
  "years": 5,
  "inflation": 6
}
```

---

## 💰 Investment Planning

```
```

```
POST /api/investment
```

Example:

```
```

```
{
  "goalAmount": 500000,
  "years": 5,
  "expectedReturn": 12,
  "monthlyExpenseTransactions": 30,
  "avgRoundOff": 20
}
```

---

## 🧠 Insights

```
```

```
POST /api/insights
```

---

## 🎯 Goals

```
```

```
GET /api/goals
POST /api/goals
DELETE /api/goals/:id
```

---

## 📊 Portfolio

```
```

```
GET /api/portfolio
POST /api/portfolio
PUT /api/portfolio/:id
DELETE /api/portfolio/:id
```

---

## 🌐 Market

### Market Overview

```
```

```
GET /api/market/overview
```

### Search Stocks

```
```

```
GET /api/market/search?q=TCS
```

### Historical Prices

```
```

```
GET /api/market/history?symbol=TCS&range=1M
```

### Market Prices

```
```

```
GET /api/market/prices
```

---

# 📊 Financial Calculations

## Savings Rate

```
```

```
Savings Rate =
Savings / Monthly Income × 100
```

## Expense Ratio

```
```

```
Expense Ratio =
Monthly Expenses / Monthly Income × 100
```

## Debt-to-Income Ratio

```
```

```
DTI =
Debt / Monthly Income × 100
```

## Future Cost

```
```

```
Future Cost =
Current Cost × (1 + Inflation Rate)^Years
```

---

# 🔄 User Flow

```
```

```
              ┌───────────────┐
              │     Sign Up   │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │     Login     │
              └───────┬───────┘
                      │
                      ▼
             ┌────────────────┐
             │    Dashboard   │
             └───────┬────────┘
                     │
       ┌─────────────┼─────────────┐
       │             │             │
       ▼             ▼             ▼
 Financial       Expenses       Goals
  Health
       │
       ▼
 What-If
 Simulator
       │
       ▼
 Future Cost
 Simulator
       │
       ▼
 Investment
 Planning
       │
       ▼
 Portfolio
 Tracking
       │
       ▼
 Market
 Analysis
       │
       ▼
 Smart
 Insights
```

---

# 🎯 Target Users

FinPilot is designed for:

-  College students 
-  Young professionals 
-  First-time investors 
-  Salaried individuals 
-  New earners 
-  Users beginning their financial planning journey 
-  Indian users interested in personal finance 

---

# 💡 Problem Statement

Managing personal finances often requires users to switch between multiple applications.

One application may track expenses.

Another may track investments.

Another may provide calculators.

Another may show market data.

This fragmentation makes financial planning complicated.

### FinPilot brings these capabilities together.

```
```

```
Expenses
    +
Financial Health
    +
Goals
    +
Future Planning
    +
Investments
    +
Market Data
    +
Insights
        ↓
   ONE PLATFORM
```

---

# 🌟 What Makes FinPilot Different?

FinPilot is not just an expense tracker or investment dashboard.

It follows a complete financial decision-making cycle:

```
```

```
UNDERSTAND
    ↓
ANALYZE
    ↓
SIMULATE
    ↓
PLAN
    ↓
INVEST
    ↓
TRACK
    ↓
IMPROVE
```

The platform is designed around helping users answer:

> **Where am I financially?**

> **What happens if I change something?**

> **What will my future goal actually cost?**

> **How much should I invest?**

> **How are my investments performing?**

> **How can I improve my financial health?**

---

# 👤 Target Users

FinPilot is designed especially for:

-  College students 
-  Young professionals 
-  First-time investors 
-  Salaried individuals 
-  New earners 
-  Indian users starting their financial planning journey 

---

# 🚀 Deployment

## Frontend

Deployed on:

```
```

```
Vercel
```

Production frontend:

```
```

```
https://fin-pilot-full-stack-website.vercel.app/
```

---

## Backend

Deployed on:

```
```

```
Render
```

Production backend:

```
```

```
https://finpilot-backend-sd6y.onrender.com
```

---

## Database

Hosted using:

```
```

```
MongoDB Atlas
```

---

# 🧪 Development Architecture

```
```

```
Local Development

Frontend
localhost:3000
      │
      ▼
Backend
localhost:5000
      │
      ▼
MongoDB Atlas


Production

Vercel
  │
  ▼
Render
  │
  ▼
MongoDB Atlas
```

---

# 🧠 Engineering Highlights

This project demonstrates practical implementation of:

-  Full-stack web development 
-  Next.js App Router 
-  React component architecture 
-  TypeScript 
-  Tailwind CSS 
-  REST API development 
-  Express.js 
-  JWT authentication 
-  Protected routes 
-  MongoDB integration 
-  Financial calculations 
-  Data visualization 
-  Market-data integration 
-  Python market utilities 
-  Environment-based API configuration 
-  Cloud deployment 
-  Responsive UI design 

---

# 🔮 Future Enhancements

Planned improvements include:

-  🤖 AI-powered financial assistant 
-  📰 Financial and market news aggregation 
-  📈 Advanced stock analytics 
-  📊 Mutual fund analysis 
-  💰 SIP planning 
-  🧠 AI-based financial recommendations 
-  🎯 Advanced goal tracking 
-  🔔 Financial alerts 
-  📱 Mobile application 
-  📄 Advanced financial reports 
-  🤖 ML-based financial prediction 
-  📊 Advanced portfolio analytics 
-  🏦 Personalized investment recommendations 
-  📉 Risk profiling 
-  🔄 Automated expense categorization 

---

# ⚠️ Disclaimer

FinPilot is an educational and financial-planning project.

Market information may be delayed and may be subject to limitations of the underlying data provider.

Financial projections, simulations, and investment-related insights are illustrative and should not be considered professional financial advice.

Users should independently verify financial information before making investment decisions.

---

# Authors:
## Khushi Chhakara
## Kanishka Sharma
## Yash Kumar

# ⭐ Support

If you find FinPilot useful, consider giving the repository a ⭐ on GitHub.

---

## 📜 License

This project is developed for educational, demonstration, and personal development purposes.
