# 🌱 Stalk.ai – AI-Powered Stock Predictions

Stalk.ai is a web application that helps investors make smarter decisions by combining **real-time market data** with **machine learning–driven predictions**. Users can build custom portfolios, explore predictive stock insights, and manage their investments through an intuitive and modern interface.

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

- **[Developer Setup Guide](./documentation/dev-setup.md)** - Quick start and workflow
- **[Development Tools](./documentation/dev-tools.md)** - Tool configurations and best practices
- [Software Requirement Specification (SRS)](./documentation/SRS%20-%20Software%20Requirement%20Specification.pdf)
- [Development Standards](./documentation/dev-standards.md)
- [Firebase Schema](./documentation/firebase-schema.md)
- [Contributing Guidelines](./documentation/contributing.md)
- [Pull Request Template](./documentation/pull_request_template.md)

---

## 👥 Team

- **Project Manager:** Canaan Wilhelmsson-Haack
- **Assistant PM:** Jack Sadler
- **Software Engineers:** Anthony Ramirez, Jacob Adams, Jacob Otero, Jason Floyd, Julian Vara, Ryan Carroll

---

## 🚦 Getting Started

### Quick Start

1. Clone the repo:

   ```bash
   git clone https://github.com/JacobAdams54/stock_project.git
   cd stock_project
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run format       # Auto-format code with Prettier
npm run test         # Run Jest tests
```

For detailed setup instructions, see **[Developer Setup Guide](./documentation/dev-setup.md)**.
