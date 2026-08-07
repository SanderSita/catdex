module.exports = ({ config }) => ({
  ...config,
  expo: {
    name: 'CatDex',
    slug: 'catdex',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'catdex',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.catdex.app',
      infoPlist: {
        NSCameraUsageDescription: 'CatDex uses your camera to photograph cats you find.',
        NSLocationWhenInUseUsageDescription:
          'CatDex shows nearby cat sightings on the map and tags new sightings with your location.',
        NSPhotoLibraryAddUsageDescription:
          'CatDex can save cat photos you capture to your photo library.',
      },
    },
    android: {
      package: 'com.catdex.app',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      permissions: ['CAMERA', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID,
        },
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-image',
      'expo-font',
      [
        'expo-camera',
        {
          cameraPermission: 'CatDex uses your camera to photograph cats you find.',
        },
      ],
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'CatDex shows nearby cat sightings on the map and tags new sightings with your location.',
        },
      ],
    ],
  },
});
