# Firebase Setup Instructions

To enable cloud storage for your PikaWorld app, you need to set up Firebase:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "pikaworld" (or any name you prefer)
4. Disable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to you
5. Click "Done"

## 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" icon (`</>`)
4. Register your app with a nickname (e.g., "pikaworld-web")
5. Copy the Firebase configuration object

## 4. Update Firebase Configuration

Replace the demo configuration in `src/services/firebaseService.ts` with your actual config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 5. Configure Firestore Rules (Optional)

In Firestore Database > Rules, you can customize security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own workspaces
    match /workspaces/{workspaceId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Allow users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 6. Test the Setup

1. Run your app: `npm run dev`
2. Go to the working page
3. Check the sync status indicator (should show green when connected)
4. Create some workspaces and data
5. Open the same URL on another device - your data should sync!

## Features

- **Automatic Sync**: Data syncs automatically when you make changes
- **Offline Support**: Works offline, syncs when connection returns
- **Cross-Device**: Access your data from any device
- **Anonymous Auth**: No login required (uses anonymous authentication)
- **Conflict Resolution**: Handles conflicts by using the most recent data

## Storage Limits

- **Firestore Free Tier**: 1GB storage, 50K reads/day, 20K writes/day
- **Upgrade**: For more usage, upgrade to a paid plan

## Troubleshooting

- If sync status shows red, check your Firebase configuration
- Check browser console for any error messages
- Ensure Firestore is enabled in your Firebase project
- Make sure your Firebase project has the correct billing setup
