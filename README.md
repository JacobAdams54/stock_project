# 🌱 Stalk.ai – AI-Powered Stock Predictions

[![CI](https://github.com/JacobAdams54/stock_project/actions/workflows/ci.yml/badge.svg)](https://github.com/JacobAdams54/stock_project/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/node-18%2B-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.4-FFCA28?logo=firebase)](https://firebase.google.com/)

Stalk.ai is a web application that helps investors make smarter decisions by combining **real-time market data** with **machine learning–driven predictions**. Users can build custom portfolios, explore predictive stock insights, and manage their investments through an intuitive and modern interface.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [System Overview](#-system-overview)
- [User Roles](#-user-roles)
- [Key Attributes](#-key-attributes)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Firebase Setup](#firebase-setup)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Available Commands](#available-commands)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Documentation](#-documentation)
- [Team](#-team)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## 🚀 Features

### For Guest Users

- Browse the homepage with trending stocks and company info.
- View **About Us** with mission and contact details.
- Create an account or log in using secure Firebase authentication.

### For Registered Users

- **Personal Portfolio**: Add and track your favorite stocks.
- **Stock Predictions**: View price history, AI-driven predictions, and buy/sell indicators.
- **Watchlist Management**: Save, update, and remove stocks easily.
- **Search & Filters**: Find stocks with keyword search and filtering options.

### For Admins

- Access the admin dashboard with site analytics.
- Manage stock data and oversee prediction algorithms via Firebase.

---

## 🛠️ Tech Stack

- **Frontend:** React + Tailwind CSS + Material UI
- **Backend/Hosting:** Firebase (Authentication, Firestore, Hosting)
- **Machine Learning:** Camber Cloud AI Server with Linear Regression Model
- **Version Control:** GitHub

---

## 📊 System Overview

- **Deployment Diagram:** The app connects a React frontend with Firebase (hosting, Firestore, auth) and an AI server that handles prediction requests (_see diagram in SRS, p.8_).
- **Data Updates:** Predictions refresh automatically at stock market open/close; users may request up to 5 manual updates per day.
- **Performance:** Firebase ensures real-time data sync, while the AI engine provides timely predictions with high reliability.

---

## 👤 User Roles

- **Guest** → View homepage, login/signup, about page.
- **Member** → Manage portfolio & watchlist, access AI-powered predictions.
- **Admin** → Modify stock data, oversee prediction algorithms, view analytics.

---

## 🔒 Key Attributes

- **Reliability:** Always-available Firebase servers with secure data handling.
- **Ease of Use:** Simple navigation, responsive UI, clear error messages.
- **Security:** Firebase Authentication with UID-based account management.

---

## 📚 Documentation

For detailed information, see our comprehensive documentation:

- **[Developer Setup Guide](./documentation/dev-setup.md)** - Quick start and workflow
- **[Development Tools](./documentation/dev-tools.md)** - Tool configurations and best practices
- **[Testing Guide](./documentation/TESTING.md)** - Testing standards and guidelines
- **[Contributing Guidelines](./documentation/contributing.md)** - How to contribute
- **[Firebase Schema](./documentation/firebase_schema.md)** - Database structure
- **[Pull Request Template](./documentation/pull_request_template.md)** - PR template

---

## 👥 Team

**Leadership:**
- **Project Manager:** Canaan Wilhelmsson-Haack
- **Assistant PM:** Jack Sadler

**Engineering Team:**
- Anthony Ramirez
- Jacob Adams
- Jacob Otero
- Jason Floyd
- Julian Vara
- Ryan Carroll

---

## License

This project is developed as part of an educational program. All rights reserved by the project team.

---

## Acknowledgements

- **Firebase** for providing the backend infrastructure
- **Camber Cloud** for AI/ML capabilities
- **Material UI** and **Tailwind CSS** for the design system
- **Vite** for the blazing-fast development experience
- **React** and the open-source community

---

## 📞 Support

For questions or support:
- Review our [documentation](./documentation/)
- Check [troubleshooting](#troubleshooting) section
- Open an issue on GitHub

---

**Built with ❤️ by the Stalk.ai Team**

---

## 🚦 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **Firebase Account** - [Sign up here](https://firebase.google.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/JacobAdams54/stock_project.git
   cd stock_project
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

   If you encounter peer dependency issues:
   ```bash
   npm install --legacy-peer-deps
   ```

### Firebase Setup

1. **Create a Firebase Project:**
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Enable Firebase Authentication (Email/Password provider)
   - Create a Firestore Database in production mode

2. **Configure Firebase:**
   - In your Firebase project settings, navigate to "Project settings" → "General"
   - Scroll down to "Your apps" and click the web icon (`</>`)
   - Register your app and copy the Firebase configuration

3. **Set up Firestore:**
   - Follow the schema documented in [Firebase Schema](./documentation/firebase_schema.md)
   - Import initial stock data (100 tickers with 5 years of historical data)

### Environment Variables

Create a `.env` file in the root directory and add your Firebase configuration:

```bash
REACT_APP_API_KEY=your_firebase_api_key
REACT_APP_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_PROJECT_ID=your_project_id
REACT_APP_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_APP_ID=your_app_id
```

> **Note:** Never commit your `.env` file to version control. It's already included in `.gitignore`.

### Running the Application

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Open your browser:**
   
   Navigate to [http://localhost:5173](http://localhost:5173)

3. **Create an account or log in** to access all features

---

## Available Commands

```bash
# Development
npm run dev          # Start Vite dev server (hot reload on http://localhost:5173)
npm run build        # Build for production (TypeScript check + Vite build)
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint on all files
npm run format       # Auto-format all code with Prettier
npm run format:check # Check if code is formatted (CI/CD)

# Testing
npm run test         # Run Jest test suite
npm run test -- --watch        # Run tests in watch mode
npm run test -- --coverage     # Generate coverage report
```

---

## Project Structure

```
stock_project/
├── .github/                 # GitHub Actions workflows
│   └── workflows/           # CI/CD pipelines
├── documentation/           # Project documentation
│   ├── dev-setup.md        # Development setup guide
│   ├── dev-tools.md        # Tool configurations
│   ├── firebase_schema.md  # Database schema
│   ├── contributing.md     # Contributing guidelines
│   ├── TESTING.md          # Testing guide
│   └── pull_request_template.md
├── public/                  # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── admin/         # Admin-specific components
│   │   ├── auth/          # Authentication components
│   │   ├── charts/        # Chart components
│   │   ├── layout/        # Layout components (Header, Footer, Sidebar)
│   │   ├── stocks/        # Stock-related components
│   │   └── watchlist/     # Watchlist management
│   ├── pages/             # Page components (route level)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities & API clients
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Root component
│   └── main.tsx           # Application entry point
├── .env                    # Environment variables (not committed)
├── .eslintrc.config.js     # ESLint configuration
├── .prettierrc             # Prettier configuration
├── babel.config.json       # Babel configuration (for Jest)
├── firebase.json           # Firebase hosting configuration
├── jest.config.cjs         # Jest configuration
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── README.md              # This file
```

---

## Architecture Overview

### System Architecture

```
┌─────────────────┐
│   React Frontend │
│   (Vite + TS)    │
└────────┬────────┘
         │
         ├─────────────────────┐
         │                     │
┌────────▼────────┐   ┌────────▼────────┐
│  Firebase        │   │  AI Server      │
│  - Auth          │   │  (Camber Cloud) │
│  - Firestore     │   │  - Linear       │
│  - Hosting       │   │    Regression   │
└──────────────────┘   └─────────────────┘
```

### Data Flow

1. **User Authentication:** Firebase Authentication manages user sessions and role-based access
2. **Stock Data:** Real-time updates via Firestore listeners
3. **AI Predictions:** 
   - Automatic refresh at market open/close
   - Manual refresh (5 times per day limit)
   - Linear regression model hosted on Camber Cloud AI Server
4. **Portfolio Management:** Firestore stores user portfolios and watchlists

### Technology Decisions

- **Vite:** Fast build tool with esbuild for optimal performance
- **TypeScript:** Type safety and better developer experience
- **Material UI + Tailwind:** Consistent design system with utility classes
- **Firebase:** Serverless backend with real-time capabilities
- **Jest + React Testing Library:** Comprehensive testing with 80%+ coverage requirement

---

## Deployment

### Firebase Hosting

This project is configured for deployment to Firebase Hosting.

1. **Install Firebase CLI:**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**

   ```bash
   firebase login
   ```

3. **Build the project:**

   ```bash
   npm run build
   ```

4. **Deploy to Firebase:**

   ```bash
   firebase deploy
   ```

### Continuous Deployment

GitHub Actions automatically deploys to Firebase Hosting:
- **Pull Requests:** Preview deployments for testing
- **Main Branch:** Production deployment on merge

See `.github/workflows/` for CI/CD configuration.

---

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode (re-runs on file changes)
npm run test -- --watch

# Generate coverage report
npm run test -- --coverage

# Run specific test file
npm run test -- Sidebar.test.tsx
```

### Testing Standards

- **Minimum Coverage:** 80% across statements, branches, functions, and lines
- **Test Location:** Co-located with components (`Component.test.tsx`)
- **Testing Libraries:** Jest, React Testing Library, jest-axe (accessibility)

For detailed testing guidelines, see [TESTING.md](./documentation/TESTING.md).

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/your-feature-name`
3. **Make your changes** following our coding standards
4. **Run quality checks:**
   ```bash
   npm run lint
   npm run format
   npm run test
   npm run build
   ```
5. **Commit your changes** with a descriptive message
6. **Push to your fork** and create a Pull Request

Please read [CONTRIBUTING.md](./documentation/contributing.md) for detailed guidelines.

---

## Troubleshooting

### Common Issues

**Build fails with TypeScript errors**
```bash
# Run TypeScript check to see detailed errors
npm run build
```

**Port 5173 already in use**
```bash
# Kill process on port 5173 (Unix/Linux/Mac)
lsof -ti:5173 | xargs kill -9

# Or change port in vite.config.ts
```

**Firebase connection issues**
- Verify your `.env` file has correct Firebase credentials
- Check Firebase project settings match your environment variables
- Ensure Firestore rules allow read/write access

**Tests failing**
```bash
# Clear Jest cache
npx jest --clearCache

# Run tests with verbose output
npm test -- --verbose
```

**ESLint errors**
```bash
# Auto-fix many issues
npm run lint -- --fix

# Format code
npm run format
```

For more troubleshooting tips, see [dev-tools.md](./documentation/dev-tools.md#troubleshooting).

---
