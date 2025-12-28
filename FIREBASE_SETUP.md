# Firebase Storage Setup Guide

This guide will help you set up Firebase Storage for image uploads in your EduSense app.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" (or select an existing project)
3. Enter project name: `edusense` (or your preferred name)
4. Follow the setup wizard (disable Google Analytics if you don't need it)

## Step 2: Enable Storage

1. In Firebase Console, go to **Storage** in the left menu
2. Click **Get started**
3. Choose **Start in production mode** (you can change rules later)
4. Select a location closest to your users
5. Click **Done**

## Step 3: Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ > **Project settings**
2. Scroll down to **Your apps** section
3. Click the **Web** icon (</>) to add a web app
4. Register your app with a nickname (e.g., "EduSense Mobile")
5. Copy the `firebaseConfig` object

It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
};
```

## Step 4: Configure Firebase in the App

### Option 1: Environment Variables (Recommended)

1. Create a `.env` file in the root directory:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

2. Install dotenv if needed:

```bash
npm install dotenv
```

3. The config file will automatically use these environment variables

### Option 2: Direct Configuration (Quick Start)

1. Open `config/firebase.ts`
2. Replace the placeholder values with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
};
```

## Step 5: Set Storage Security Rules

1. In Firebase Console, go to **Storage** > **Rules**
2. Update the rules. Since you're using JWT authentication (not Firebase Auth), use these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to upload avatars (your FastAPI backend validates users)
    match /avatars/{userId}/{fileName} {
      allow read: if true; // Anyone can read
      allow write: if request.resource.size < 5 * 1024 * 1024 // Max 5MB
                    && request.resource.contentType.matches('image/.*'); // Only images
    }

    // Allow anyone to upload lesson content (your FastAPI backend validates users)
    match /lessons/{userId}/{fileName} {
      allow read: if true; // Anyone can read
      allow write: if request.resource.size < 10 * 1024 * 1024; // Max 10MB
    }
  }
}
```

3. Click **Publish**

**Note**: These rules allow uploads without Firebase Authentication since you're using JWT from your FastAPI backend. For better security in production, consider:

- Using Firebase Admin SDK to generate signed URLs on your backend
- Adding rate limiting
- Adding more file type restrictions

## Step 6: Test the Integration

1. Run your app: `npm start`
2. Go to Edit Profile screen
3. Click on the avatar
4. Select an image
5. The image should upload to Firebase Storage
6. The URL should be saved to your backend

## Step 7: Verify Upload

1. Go to Firebase Console > **Storage**
2. You should see a folder structure like:
   ```
   avatars/
     └── user-id_timestamp.jpg
   ```

## How It Works

1. User selects an image → Opens image picker
2. Image is selected → Shows preview immediately
3. Uploads to Firebase Storage → `avatars/{userId}_{timestamp}.jpg`
4. Gets download URL → Public URL from Firebase
5. Saves URL to backend → Updates user profile with `avatar_url`
6. Avatar displays → Shows the uploaded image

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"

- Check that your API key is correct in `config/firebase.ts`
- Make sure environment variables are loaded (if using .env)

### Error: "Permission denied"

- Check Storage security rules in Firebase Console
- Make sure the user is authenticated

### Image not uploading

- Check internet connection
- Check Firebase Storage is enabled
- Check browser console for detailed error messages

### Upload works but image doesn't display

- Check that the URL is being saved to the backend
- Verify the URL is accessible (try opening in browser)
- Check CORS settings if needed

## Security Best Practices

1. **Production Rules**: Use more restrictive rules in production
2. **File Validation**: Add client-side validation for file types and sizes
3. **Quota Limits**: Set up storage quotas in Firebase
4. **Image Optimization**: Consider resizing images before upload
5. **Access Control**: Use Firebase Authentication for better access control

## Next Steps

- Add image compression before upload
- Add progress indicators for large uploads
- Implement image deletion when user changes avatar
- Add support for other file types (videos, documents, etc.)
