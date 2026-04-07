# Lufyco_Clothing - Frontend

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Prerequisites
- [Node.js](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

## Installation & Setup

> **IMPORTANT**: If you are moving this project between operating systems (e.g., Mac to Windows), you **MUST** delete the `node_modules` folder and `package-lock.json` file before installing dependencies.

### Windows (PowerShell)
1. Navigate to the frontend directory:
   ```powershell
   cd Lufyco_Frontend
   ```
2. Check for `node_modules` or `.expo` folders from other OSs and delete them if present.
3. Install dependencies:
   ```powershell
   npm install
   ```

### Mac OS / Linux (Terminal)
1. Navigate to the frontend directory:
   ```bash
   cd Lufyco_Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the App

Start the Expo development server:
```bash
npx expo start
```

In the output, you'll find options to open the app in a:
- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo
- [Web](https://docs.expo.dev/workflow/web/)

## API Configuration
The app automatically detects your computer's IP address for the backend (`api.js`) using `expo-constants`. No manual IP configuration is needed for local development.

## Troubleshooting

### "Cannot find module 'react'"
This error often occurs when moving `node_modules` from Mac to Windows. To fix:
1. Delete `node_modules` folder.
2. Delete `.expo` folder.
3. Delete `package-lock.json`.
4. Run `npm install`.
