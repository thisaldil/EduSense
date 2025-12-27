# Backend Integration Guide

This guide explains how the React Native app connects to the FastAPI backend.

## Overview

The integration is complete! Your React Native app can now communicate with your FastAPI backend at `http://127.0.0.1:8000`.

## Architecture

### 1. API Configuration (`config/api.ts`)

- Manages the base API URL
- Handles platform-specific URLs (iOS Simulator, Android Emulator, physical devices)
- Default: `http://127.0.0.1:8000`

### 2. API Client (`services/api.ts`)

- Handles all HTTP requests
- Automatically adds JWT tokens to requests
- Manages secure token storage using `expo-secure-store`

### 3. Authentication Service (`services/auth.ts`)

- Provides `register()`, `login()`, and `logout()` functions
- Handles token storage after successful authentication
- Includes helper functions for name splitting and username generation

### 4. Authentication Context (`contexts/AuthContext.tsx`)

- Provides authentication state throughout the app
- Exposes `useAuth()` hook for components
- Manages user state, loading states, and errors

### 5. Updated Screens

- **SignUpScreen**: Now integrates with `/api/auth/register`
- **SignInScreen**: Now integrates with `/api/auth/login`

## How to Use

### For Development (Simulator/Emulator)

The app is already configured to work with your backend at `http://127.0.0.1:8000`:

- **iOS Simulator**: Uses `http://127.0.0.1:8000` ✅
- **Android Emulator**: Uses `http://10.0.2.2:8000` (maps to host's localhost) ✅

### For Physical Devices

If testing on a physical device, you need to use your computer's local IP address instead of `127.0.0.1`:

1. **Find your computer's local IP**:

   - Mac/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Windows: `ipconfig` (look for IPv4 Address)

2. **Update the API URL** in `config/api.ts`:

   ```typescript
   // Change this line to your IP
   return "http://YOUR_LOCAL_IP:8000";
   ```

3. **Make sure your backend allows connections** from your local network (check CORS settings)

### Environment Variables (Optional)

You can also set the API URL via environment variables in `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_IP:8000"
    }
  }
}
```

## API Endpoints Used

### Registration

- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "email": "student@example.com",
    "username": "student123",
    "password": "securepass123",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "2010-05-15",
    "gender": "male"
  }
  ```

### Login

- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "student@example.com",
    "password": "securepass123"
  }
  ```
- **Response**: Includes `access_token` and `user` object

## Using Authentication in Your Components

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  // Access current user
  console.log(user?.email);

  // Check if authenticated
  if (isAuthenticated) {
    // Show protected content
  }

  // Logout
  const handleLogout = async () => {
    await logout();
  };
}
```

## Token Storage

- Tokens are securely stored using `expo-secure-store`
- Automatically included in all API requests via the `Authorization` header
- Format: `Authorization: Bearer <token>`

## Making API Calls

Use the API client functions from `services/api.ts`:

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";

// GET request
const lessons = await apiGet(API_ENDPOINTS.LESSONS);

// POST request
const newLesson = await apiPost(API_ENDPOINTS.LESSONS, {
  title: "New Lesson",
  content: "...",
});

// All requests automatically include the auth token!
```

## Notes on SignUpScreen

The SignUpScreen currently collects:

- Full name (split into first_name and last_name)
- Email (used to generate username)
- Password

Default values are used for:

- `date_of_birth`: "2010-01-01"
- `gender`: "other"

To add date picker and gender selection, update `features/auth/screens/SignUpScreen.tsx`.

## Troubleshooting

### Connection Issues

1. **"Network request failed"**

   - Check if backend is running at `http://127.0.0.1:8000`
   - For physical devices, use your computer's local IP
   - Ensure backend CORS allows your app's origin

2. **401 Unauthorized**

   - Token might be expired or invalid
   - User needs to login again

3. **CORS Errors**
   - Make sure your FastAPI backend has CORS middleware configured
   - Example:

     ```python
     from fastapi.middleware.cors import CORSMiddleware

     app.add_middleware(
         CORSMiddleware,
         allow_origins=["*"],  # In production, specify your app's origin
         allow_credentials=True,
         allow_methods=["*"],
         allow_headers=["*"],
     )
     ```

## Next Steps

1. ✅ Authentication is complete
2. 🔲 Add date picker and gender selection to SignUpScreen
3. 🔲 Implement token refresh
4. 🔲 Add protected route handling
5. 🔲 Integrate other API endpoints (lessons, quizzes, etc.)
