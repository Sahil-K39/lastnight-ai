# LastNight AI Flutter

This is the fully Flutter mobile app for LastNight AI. It replaces the earlier native-only mobile direction with one shared Dart/Flutter codebase for Android and iOS.

## Features

- Flutter Material 3 dark cinematic UI
- Login and signup demo flow
- Local password hash validation for demo accounts
- Optional profile picture
- College/study profile: college, degree, branch, semester, roll number, target exam
- Dedicated PYQ upload flow
- Syllabus and notes upload flow
- Panic mode selector
- Shared backend integration with `POST /api/analyze`
- Local fallback results when the backend is unavailable
- Synced upload payload shape with the website, including supported binary file data URLs

## Backend Defaults

The app talks to the existing web backend:

- Android emulator: `http://10.0.2.2:3000/`
- iOS simulator: `http://127.0.0.1:3000/`

For deployed builds, pass your backend URL:

```bash
flutter run --dart-define=API_BASE_URL=https://your-backend.example.com/
```

Uploads follow the shared backend limits: 8 files, 10MB per file, and 20MB per study kit.

## Run

Install Flutter first, then:

```bash
cd "/Users/sahil/Documents/LASTNIGHT AI/lastnight-ai-flutter"
flutter pub get
flutter run
```

For Android:

```bash
flutter run -d android
```

For iOS:

```bash
flutter run -d ios
```

## Notes

This machine currently does not have Flutter or Dart installed, so the app source and platform folders were scaffolded manually and syntax could not be validated with `flutter analyze` here. Once Flutter is installed, run:

```bash
flutter create --platforms=android,ios .
flutter pub get
flutter analyze
```

The `flutter create` command is safe to run inside this folder because the Dart app code is already in `lib/main.dart`; it refreshes any platform runner details to match your installed Flutter SDK.
