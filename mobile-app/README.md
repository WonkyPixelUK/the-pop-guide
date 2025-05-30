# PopGuide Mobile App 📱

A React Native app built with Expo for managing your Funko Pop collection.

## Features ✨

- **Barcode Scanning** - Scan Funko Pop barcodes to add to your collection
- **Collection Management** - View, organize, and manage your Funkos
- **Wishlist & Trading** - Mark items for wishlist or trading
- **User Authentication** - Secure login/registration with Supabase
- **Dark Theme** - Beautiful dark UI matching the PopGuide brand
- **Cross-Platform** - Works on both iOS and Android

## Prerequisites 📋

- Node.js (v16 or later)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Setup Instructions 🚀

### 1. Install Dependencies
```bash
cd mobile-app
npm install
```

### 2. Environment Configuration
Copy the example environment file and fill in your Supabase credentials:
```bash
cp env.example .env
```

Edit `.env` with your Supabase project details:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server
```bash
npm start
```

This will open the Expo Dev Tools. You can then:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app on your device

## Building for Production 🏗️

### Install EAS CLI
```bash
npm install -g eas-cli
```

### Login to Expo
```bash
eas login
```

### Build for iOS
```bash
npm run build:ios
```

### Build for Android
```bash
npm run build:android
```

### Build for Both Platforms
```bash
npm run build:all
```

## App Structure 📁

```
src/
├── contexts/
│   └── AuthContext.tsx     # Authentication state management
├── screens/
│   ├── LoginScreen.tsx     # User login
│   ├── RegisterScreen.tsx  # User registration
│   ├── CollectionScreen.tsx # Collection management
│   ├── ScannerScreen.tsx   # Barcode scanning
│   ├── DetailsScreen.tsx   # Funko details
│   ├── CreateListScreen.tsx # List creation
│   └── ProfileScreen.tsx   # User profile
└── services/
    ├── auth.ts             # Authentication service
    └── supabase.ts         # Supabase client
```

## Key Features 🎯

### Authentication
- Email/password registration and login
- Secure session management with Supabase
- Profile management and sign out

### Collection Management
- View all your Funkos in a beautiful grid
- Mark items as wishlist or for trading
- Empty state with call-to-action
- Loading states and error handling

### Barcode Scanning
- Camera permission handling
- Real-time barcode scanning
- Automatic Funko lookup in database
- Error handling for unknown barcodes

### Dark Theme
- Consistent with PopGuide web app
- Orange accent color (#e46c1b)
- Dark backgrounds and surfaces
- Proper contrast for accessibility

## Scripts 📜

- `npm start` - Start development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run build:ios` - Build iOS app
- `npm run build:android` - Build Android app
- `npm run submit:ios` - Submit to App Store
- `npm run submit:android` - Submit to Google Play

## Environment Variables 🔐

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Troubleshooting 🔧

### Common Issues

1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **iOS simulator not opening**: Ensure Xcode is installed
3. **Android emulator issues**: Check Android Studio setup
4. **Supabase connection**: Verify environment variables

### Build Issues

1. **EAS Build fails**: Check `eas.json` configuration
2. **iOS signing**: Ensure Apple Developer account is set up
3. **Android signing**: Configure keystore in EAS

## Contributing 🤝

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## Support 💬

For support and questions:
- Check the [main README](../README.md)
- Open an issue on GitHub
- Contact the development team

---

Built with ❤️ using Expo and React Native 