# LOAF - React Native Expo App 🍞

A modern React Native application built with Expo Router, featuring Firebase integration, NativeWind styling, and custom typography components.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo-url>
   cd loaf
   npm install

2. **Set up environment variables**
Create a .env file in the root directory with your Firebase configuration:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

3. **Test the Firebase Connection**
Run ``npm run test-firebase``. Check that the output doesn't have any errors.

4. **Start the development server**
Run `npm start` in the terminal.

