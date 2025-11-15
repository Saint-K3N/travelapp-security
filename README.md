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

LINK: https://travelapp-security.web.app 

## 📄 License

This project is developed for educational purposes as part of INT6005CEM Security coursework.

---

**Last Updated:** November 2025  
**Version:** 2.0 (Secure Firebase Implementation)
