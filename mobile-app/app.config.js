import 'dotenv/config';

export default {
  expo: {
    name: "PopGuide",
    slug: "pop-universe-tracker",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.popguide.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.popguide.app",
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      // Supabase configuration optimized for transaction pooler
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      // Performance settings
      enableHermes: true,
      enableNetworkInspector: process.env.NODE_ENV === 'development',
      // Transaction pooler optimization flags
      dbPoolMode: 'transaction',
      dbOptimizations: {
        maxConnections: 20,
        connectionTimeout: 10000,
        queryTimeout: 30000,
        enablePreparedStatements: true
      }
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Allow PopGuide to access your camera to scan Funko Pop barcodes."
        }
      ],
      [
        "expo-barcode-scanner",
        {
          cameraPermission: "Allow PopGuide to access your camera to scan Funko Pop barcodes."
        }
      ]
    ]
  }
}; 