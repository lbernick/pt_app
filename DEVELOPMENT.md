# PT App

A React Native application built with Expo.

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- For iOS development: macOS with Xcode
- For Android development: Android Studio with Android SDK

## Project Structure

```
pt_app/
├── App.tsx             # Main application component - entry point
├── App.test.tsx        # Example test file for App component
├── app.json            # Expo configuration (app name, version, icons, etc.)
├── package.json        # Project dependencies and scripts
├── index.js            # App registration point
├── tsconfig.json       # TypeScript configuration
├── eslint.config.js    # ESLint configuration (v9 flat config)
├── jest.config.js      # Jest testing configuration
├── jest.setup.js       # Jest setup file
├── assets/             # Static assets (images, fonts, icons)
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash.png
└── node_modules/       # Installed dependencies (auto-generated)
```

## Installation

1. Clone or navigate to the project directory:
```bash
cd pt_app
```

2. Install dependencies (already done if you just created the project):
```bash
npm install
```

## Configuration

### Environment Variables

The app automatically loads environment variables from a `.env` file in the project root.

To get started, copy the example environment file and configure it:

```bash
cp .env.example .env
```

Available environment variables:

- **`EXPO_PUBLIC_BACKEND_URL`** (optional)
  - Backend API URL
  - Default: `http://localhost:8000`
  - Example: `http://192.168.1.100:8000`

- **`EXPO_PUBLIC_AUTH_TOKEN`** (optional)
  - Authentication token for API requests
  - If provided, all API requests will include an `Authorization: Bearer <token>` header
  - Default: none (no authentication)
  - Example: `your-secret-token-here`

This is temporary for local development; login support will be added with firebase auth.

Example `.env` file:

```bash
# Backend API URL
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000

# Authentication Token (optional)
EXPO_PUBLIC_AUTH_TOKEN=your-secret-token-here
```

### Dynamic Navigation

The app automatically determines which screen to show based on whether a training plan exists on the backend:

#### App Startup Flow

1. **Loading State**
   - On app startup, the app shows a loading spinner
   - Makes a `GET /api/v1/training-plan` request to check for an existing plan

2. **No Training Plan (404 Response)**
   - Displays the **OnboardingScreen** with chat interface
   - No bottom navigation tabs
   - Single-screen focused experience with progress tracking
   - **Onboarding Flow**:
     - Shows welcome header with "Welcome to PT App" title
     - Displays progress percentage based on collected onboarding data
     - Automatically initiates conversation on screen load
     - Calls `POST /api/v1/onboarding/message` with conversation history
     - Displays assistant messages and collects user responses via chat UI
     - Continues conversation until `is_complete: true` is received
     - Shows "Onboarding Complete! ✓" message when finished
     - Generates training plan via `POST /api/v1/training-plan`
     - Automatically transitions to the main app after plan is created

3. **Training Plan Exists**
   - Shows full app experience with three tabs:
     - **Workout**: Today's workout with exercise tracking
     - **History**: Past and upcoming workouts (list and calendar views)
     - **Training Plan**: View and manage your training plan

The navigation is dynamic and based on backend state - no environment variable configuration needed.

## Running the App

### Start Development Server

```bash
npm start
```

This opens the Expo Developer Tools in your browser. From there you can:

- Press `i` to open iOS Simulator (macOS only)
- Press `a` to open Android Emulator
- Press `w` to open in web browser
- Scan the QR code with your device

### Run on Specific Platforms

**iOS (macOS only):**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Web:**
```bash
npm run web
```

### Run on Physical Device

1. Install the **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Run `npm start` in your project
3. Scan the QR code:
   - **iOS**: Use the Camera app
   - **Android**: Use the Expo Go app's QR scanner

## Development Workflow

1. Make changes to `App.js` or other files
2. Save the file
3. The app will automatically reload with your changes (Fast Refresh)

## TypeScript Support

This project is configured with TypeScript. You can use both `.js` and `.tsx`/`.ts` files:
- TypeScript files get full type checking and IntelliSense
- JavaScript files are also supported for gradual migration
- Run `npm run typecheck` to check for type errors

## Testing

Tests are configured with Jest and React Native Testing Library:
- Place test files next to the code they test with `.test.ts` or `.test.tsx` extension
- Or create a `__tests__` folder for test files
- Run `npm test` to run all tests
- Example test file: `App.test.tsx`

## Available Scripts

### Running the App
- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser

### Code Quality
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Run ESLint and automatically fix issues
- `npm run typecheck` - Run TypeScript type checking

### Testing
- `npm test` - Run Jest tests
- `npm run test:watch` - Run Jest in watch mode
- `npm run test:coverage` - Run Jest with coverage report

## Learning Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Documentation](https://react.dev/)

## Troubleshooting

**Metro bundler issues:**
```bash
npm start -- --clear
```

**Dependency issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**iOS simulator not opening:**
- Ensure Xcode is installed
- Run `xcode-select --install` if needed

**Android emulator not opening:**
- Ensure Android Studio is installed
- Create an AVD (Android Virtual Device) in Android Studio
