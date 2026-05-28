# LastNight AI Mobile Apps

LastNight AI now has a Flutter-first mobile path for both major platforms:

- Flutter Android + iOS: `lastnight-ai-flutter`
- Local legacy native Android reference: `lastnight-ai-flutter-mobile-app`
- Local legacy native iOS reference: `lastnight-ai-ios`

The earlier mobile folders are still present locally as archived references, but they are ignored for the public GitHub push. The app to move forward with is now `lastnight-ai-flutter`.

## Shared Backend

The Flutter app uses the same web backend endpoint:

```text
POST /api/analyze
```

Local development defaults:

- Android emulator: `http://10.0.2.2:3000/`
- iOS simulator: `http://127.0.0.1:3000/`

For physical devices, use your deployed HTTPS backend URL.

## Flutter App

Location:

```text
lastnight-ai-flutter
```

The Flutter app includes:

- Cinematic dark background
- Login and signup
- Optional profile picture
- College and studying details
- File importer for syllabus, notes, and PYQ files
- Shared upload limits: 8 files, 10MB per file, 20MB per kit
- Panic mode, progress, and results screens
- Shared `/api/analyze` backend integration
- Offline fallback mock results

Run:

```bash
cd "/Users/sahil/Documents/LASTNIGHT AI/lastnight-ai-flutter"
flutter pub get
flutter run
```

## Current Verification Notes

This machine does not have Flutter or Dart installed, and it only has Xcode Command Line Tools rather than the full iOS SDK. That means `flutter analyze`, Android builds, and iOS simulator builds cannot be verified locally here. The Flutter source and platform scaffolding are in place for a machine with Flutter installed.
