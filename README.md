# SACCO Risk Manager

An AI-Powered SACCO Loan Risk Management System built with React, Vite, Firebase, and Google Gemini AI.

## Features

- **AI Risk Assessment**: Automated loan risk analysis using Google Gemini.
- **Automated Decisions**: Instant approval/rejection based on AI qualification.
- **Wallet System**: Deposit, withdraw, and pay loans using Mobile Money (MTN/Airtel) or Bank Transfer.
- **Multi-Currency**: Support for UGX, USD, KES, EUR, and GBP with real-time conversion.
- **Multi-Language**: Support for English, Swahili, and Luganda.
- **PWA Support**: Installable on Android, iOS, and Desktop.
- **Role-Based Access**: Different views for Members, Monitors, and Administrators.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase Project (Firestore & Auth enabled)
- Google Gemini API Key

## Installation

1. **Clone the repository** (or copy the files).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add your keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
4. **Firebase Configuration**:
   Ensure `src/firebase-applet-config.json` (or your manual config in `src/firebase.ts`) is correctly set up with your Firebase project details.

## Running the App

### Development Mode
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### Production Build
```bash
npm run build
```
The production-ready files will be in the `dist/` folder.

## Project Structure

- `src/components/`: Reusable UI components.
- `src/lib/`: Utility functions and AI integration (`gemini.ts`).
- `src/types/`: TypeScript interfaces and types.
- `src/constants/`: App constants and translations.
- `src/firebase.ts`: Firebase initialization.
- `src/App.tsx`: Main application entry and routing.

## License

MIT
