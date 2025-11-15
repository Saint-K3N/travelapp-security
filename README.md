# TravelCompanion - Secure Travel Planning Application

A comprehensive web application for planning and managing travel itineraries with integrated weather forecasting, currency conversion, and social sharing capabilities. This project demonstrates secure application development practices with Firebase Authentication and hosting.

## 📋 Project Overview

TravelCompanion is a React-based single-page application (SPA) that helps users plan their trips by providing essential travel tools in one centralized platform. The application implements security best practices including input validation, password complexity enforcement, account lockout mechanisms, and encrypted communication.

**Developed as part of:** INT6005CEM Security 
**Institution:** INTI International College Penang (Coventry University UK)

## Contributors: 
- Saint-K3N (Tan Khoon Khye)
- desmond0315 (Desmond Kok)
- NawaSM (Nawa Silumelume Mubukwanu)
- Phin0508 (Ee Leong Zjen Phin)
- Anyalex22 (Lee Yueh Yu) 

## ✨ Core Features

### 🗺️ Travel Planner
- Create, edit, and delete travel itineraries
- Add destinations with dates and notes
- Organize multiple trips in one dashboard
- Persistent storage using Firebase Firestore

### 🌤️ Weather Information
- Real-time weather data for any city worldwide
- Current temperature, conditions, and descriptions
- Powered by OpenWeatherMap API
- Helpful for trip planning and packing decisions

### 💱 Currency Converter
- Convert between multiple international currencies
- Real-time exchange rates
- Support for major world currencies (USD, EUR, GBP, JPY, MYR, etc.)
- Integrated with ExchangeRate-API

### 📱 Social Sharing
- Share travel plans on social media platforms
- Connect with Facebook, Twitter, Instagram, WhatsApp
- Export and share itineraries with friends and family

### 👤 User Profile & Authentication
- Secure user registration with email verification
- Login with password complexity requirements
- Account lockout after failed login attempts
- Profile management and logout functionality

## 🔒 Security Features

This application implements enterprise-grade security controls:

- **Input Validation**: Dual-layer (client + server) validation preventing injection attacks
- **Password Enforcement**: Minimum 6 characters with uppercase, lowercase, numbers, and special characters
- **Account Lockout**: 3-attempt threshold with 2-minute automatic lockout
- **Rate Limiting**: Client-side and Firebase server-side protection against brute force
- **Secure Communication**: HTTPS with TLS 1.3 encryption via Firebase Hosting
- **Error Handling**: Generic error messages preventing information disclosure
- **Output Encoding**: React JSX automatic escaping preventing XSS attacks

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account (for deployment)
- API Keys:
  - OpenWeatherMap API key
  - ExchangeRate-API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travelcompanion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_WEATHER_API_KEY=your_openweathermap_key
   REACT_APP_EXCHANGE_RATE_API_KEY=your_exchangerate_api_key
   ```

4. **Initialize Firebase**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   ```

### Running Locally

**Development mode:**
```bash
npm start
```
Application will open at `http://localhost:3000`

**Production build:**
```bash
npm run build
```

**Test locally before deployment:**
```bash
npm run firebase:serve
```

### Deployment

**Deploy to Firebase Hosting:**
```bash
npm run deploy
```

Or manually:
```bash
npm run build
firebase deploy --only hosting
```

Your app will be live at: `https://your-project.web.app`

## 📁 Project Structure

```
travelcompanion/
├── public/                 # Static files
├── src/
│   ├── components/        # React components
│   │   ├── Home.js       # Landing page
│   │   ├── Profile.js    # Login/Profile management
│   │   ├── Register.js   # User registration
│   │   ├── TravelPlans.js # Travel planner
│   │   ├── Weather.js    # Weather lookup
│   │   ├── Currency.js   # Currency converter
│   │   └── Share.js      # Social sharing
│   ├── services/
│   │   ├── authService.js         # Firebase authentication
│   │   ├── loginAttemptService.js # Account lockout logic
│   │   └── firebase.js            # Firebase configuration
│   ├── App.js            # Main app component
│   ├── App.css           # Global styles
│   └── index.js          # Entry point
├── firebase.json         # Firebase hosting config
├── package.json          # Dependencies
└── .env                  # Environment variables
```

## 🔑 Default Demo Credentials

For testing purposes (first version only):
- **Email:** user@travel.com
- **Password:** travel123

**Note:** For the secure Firebase version, please register a new account.

## 🛠️ Technologies Used

- **Frontend:** React 18.3.1
- **Routing:** React Router DOM 6.28.0
- **Authentication:** Firebase Authentication 11.0.2
- **Database:** Firebase Firestore 11.0.2
- **Hosting:** Firebase Hosting 13.27.0
- **APIs:** 
  - OpenWeatherMap API (Weather data)
  - ExchangeRate-API (Currency conversion)
- **Icons:** React Icons 5.3.0

## 📊 Security Testing

This application has been tested using:
- OWASP ZAP (Zed Attack Proxy) for vulnerability scanning
- Manual penetration testing for authentication bypass
- Brute force attack simulation

Security improvements from Version 1 to Version 2:
- ✅ Eliminated client-side authentication bypass
- ✅ Implemented server-side validation
- ✅ Added account lockout mechanism
- ✅ Enforced password complexity
- ✅ Migrated to HTTPS with TLS 1.3 encryption

## 📄 License

This project is developed for educational purposes as part of INT6005CEM Security coursework.

---

**Last Updated:** November 2025  
**Version:** 2.0 (Secure Firebase Implementation)
