# EduSense — React Native Application Documentation

## Research Project Documentation

**Document Version:** 1.0  
**Application:** EduSense (Multisensory Learning Platform)  
**Platform:** React Native (Expo) — iOS, Android, Web

---

## 1. Introduction

### 1.1 Project Overview

**EduSense** is a mobile-first, multisensory learning application developed as a research project. The application aims to transform traditional educational content into rich, multisensory experiences by combining **visual**, **audio**, and **haptic** modalities. The goal is to support deeper comprehension and retention through adaptive, sensory-integrated learning and to explore the role of **cognitive load** in learning outcomes.

### 1.2 Research Context

The project sits at the intersection of:

- **Multisensory learning** — leveraging sight, hearing, and touch for improved encoding and recall.
- **Cognitive load theory** — measuring and adapting to learners' mental load (Low, Medium, High) during activities and assessments.
- **Adaptive learning** — suggesting content and activities based on inferred or predicted cognitive load and performance.

The React Native application serves as the **front-end client** that consumes a backend API for lessons, quizzes, activities, and user progress. The backend (proposed in separate documentation) is responsible for content processing, quiz generation, cognitive load prediction, and activity provisioning.

### 1.3 Target Users

- **Learners** — Students who consume lessons, take quizzes, and use the Concept Playground for practice activities.
- **Educators / Researchers** — Stakeholders interested in multisensory pedagogy and cognitive load in educational technology.

---

## 2. Application Summary

EduSense allows users to:

1. **Sign up / Sign in** and maintain a persistent session (JWT-based auth).
2. **Create lessons** by submitting educational text; the system (backend) processes it into concepts, visuals, audio, and haptics.
3. **Experience lessons** in a **Lesson Player** with step-by-step concepts, optional video, audio narration, and haptic feedback toggles.
4. **Take quizzes** generated from lessons, with optional **cognitive load features** (response time, answer changes, errors, etc.) sent to the backend for analysis.
5. **View quiz results** including score and **cognitive load** prediction (Low/Medium/High) when provided by the API.
6. **Use the Concept Playground** to complete learning activities (True/False, MCQ, Matching, Fill-in-the-Blank) filtered by **cognitive load** and **activity type**, with feedback and suggested next activities based on performance.
7. **Browse a Library** of lessons (with sensory modes: Visual, Audio, Haptic) and view **Progress** (streaks, subject progress, achievements).

The app uses **Expo Router** for file-based navigation and integrates with a configurable backend base URL (e.g. `http://127.0.0.1:8000` for development).

---

## 3. Technology Stack

### 3.1 Core

| Layer        | Technology |
|-------------|------------|
| Framework   | React 19.1, React Native 0.81.5 |
| Toolchain   | Expo SDK 54 (Expo Router 6) |
| Language    | TypeScript 5.9 |
| Navigation  | Expo Router (file-based), React Navigation Stack & Bottom Tabs |

### 3.2 Key Libraries

- **expo-av** — Video/audio playback in the Lesson Player.
- **expo-haptics** — Haptic feedback (e.g. on quiz correct/incorrect, tab presses).
- **expo-image** — Optimized image loading.
- **expo-secure-store** — Secure token storage on device; `localStorage` on web.
- **expo-font** — Inter and Poppins fonts.
- **React Native Reanimated** — Animations (e.g. processing screen).
- **Firebase** — App and Storage (e.g. for assets or uploads as per project setup).

### 3.3 Backend Integration

- **HTTP client:** `fetch`-based API client in `services/api.ts`.
- **Auth:** Bearer JWT stored via `expo-secure-store` (native) or `localStorage` (web).
- **Endpoints:** Centralized in `config/api.ts`; base URL can be overridden via Expo config (`extra.apiUrl`) or defaults per platform (e.g. `127.0.0.1:8000` for iOS, configurable IP for Android).

---

## 4. Application Architecture

### 4.1 High-Level Flow

1. **Splash** → **Onboarding** (first run) → **Welcome** (Sign In / Create Account).
2. After authentication → **Tab navigator**: Home, Library, Progress, Profile (and Upload where applicable).
3. From **Home**, user can start a **New Lesson** (title, subject, content) → **Processing** (staged progress UI) → **Lesson Player**.
4. From Lesson Player or lesson flow → **Quiz** (generate/take) → **Quiz Result** (with optional cognitive load from API).
5. **Concept Playground** can be entered with optional `lesson_id`, `cognitive_load`, and `activity_type`; it fetches activities from the backend and suggests follow-up by inferred cognitive load.
6. **Settings**, **Edit Profile**, and **Auth** screens complete the flows.

### 4.2 Navigation Structure (Expo Router)

- **Root Stack** (`app/_layout.tsx`): Splash, Onboarding, Welcome, Auth (signin, signup), (tabs), Lessons (new-lesson, lesson-player, processing, quiz, quiz-result, quiz-review, quiz-loading, concept-explore, concept-playground), Settings, Edit Profile, Modal.
- **Tabs** (`app/(tabs)/`): Index (Home), Library, Progress, Profile (and Upload if present).

### 4.3 Key Directories

```
app/
  _layout.tsx              # Root layout, fonts, AuthProvider, Stack
  splash.tsx                # Splash screen
  welcome.tsx               # Welcome + Sign In / Create Account CTAs
  auth/
    signin.tsx
    signup.tsx
  (tabs)/
    index.tsx               # Home (continue learning, recommended, new lesson CTA)
    library.tsx             # Lesson library (filters, sensory modes)
    progress.tsx            # Progress dashboard
    profile.tsx             # Profile
  lessons/
    new-lesson.tsx         # Create lesson (subject + content)
    processing.tsx         # Processing stages → Lesson Player
    lesson-player.tsx       # Concept-by-concept lesson with video/audio/haptics
    quiz.tsx               # Take quiz, submit with optional cognitive_load_features
    quiz-result.tsx        # Score + cognitive load from API
    quiz-review.tsx
    quiz-loading.tsx
    concept-explore.tsx    # Concept exploration
    concept-playground.tsx # Activities (TRUE_FALSE, MCQ, MATCHING, FILL_BLANK_WORD_BANK)
components/                 # Reusable UI (e.g. HapticTab)
constants/
  theme.ts                  # Colors, Typography
contexts/
  AuthContext.tsx           # Auth state, login, register, logout
services/
  api.ts                    # apiRequest, apiGet, apiPost, token storage
  auth.ts                   # login, register, logout
  lessons.ts                # Lessons, quizzes, activities API
config/
  api.ts                    # API_BASE_URL, API_ENDPOINTS
types/
  activities.ts             # Activity types, cognitive load inference helpers
features/
  auth/                     # Auth screens logic
  onboarding/               # Onboarding slides data
  settings/                 # Settings screen
docs/                       # API prompts and documentation
```

---

## 5. Core Features (Detailed)

### 5.1 Authentication

- **AuthContext** holds `user`, `isAuthenticated`, `login`, `register`, `logout`, `updateUser`, and error state.
- Token is stored securely (SecureStore on native, `localStorage` on web) and sent as `Authorization: Bearer <token>`.
- Home and protected routes redirect to `/welcome` when not authenticated.

### 5.2 Lesson Creation and Processing

- **New Lesson** (`app/lessons/new-lesson.tsx`): User selects subject (Science, Physics, Literature, Math), enters lesson text (max 2000 chars), and submits. `createLesson` sends `POST /api/lessons` with `title`, `subject`, `content`.
- **Processing** (`app/lessons/processing.tsx`): Displays staged steps (e.g. "Analyzing content", "Extracting key concepts", "Generating visuals", "Creating audio", "Designing haptics") with progress animation, then navigates to Lesson Player with `lesson_id`.

### 5.3 Lesson Player

- **Lesson Player** (`app/lessons/lesson-player.tsx`) presents a lesson as a sequence of **concepts**. Each concept has title, description, audio script, and haptics description.
- Features: step progress bar, previous/next, play/pause (video), toggles for **Audio** and **Haptics**.
- Currently uses a fixed "Gravity" concept set for demo; in full flow this would be driven by lesson data from the backend.

### 5.4 Quizzes and Cognitive Load

- **Quiz** (`app/lessons/quiz.tsx`): Loads quiz by `quiz_id` via `getQuiz`, records answers, and optionally collects **cognitive load features** (e.g. answer changes, error streak, total score, accuracy, idle gaps, response time variability, completion time, average response time). On submit, `submitQuiz` sends these via `SubmitQuizRequest` to `POST /api/quizzes/:quizId/submit`.
- **Quiz Result** (`app/lessons/quiz-result.tsx`): Displays score and, when available, **cognitive load** (Low/Medium/High) and confidence/scores from `getQuizResults` (`GET /api/quizzes/:quizId/results`). Used for research and adaptive follow-up.

### 5.5 Concept Playground (Activities)

- **Concept Playground** (`app/lessons/concept-playground.tsx`) is the main activity hub:
  - **Data:** Fetches activities from `GET /api/activities` or `GET /api/lessons/:lessonId/activities` with optional filters: `cognitive_load` (LOW, MEDIUM, HIGH) and `activity_type` (TRUE_FALSE, MCQ, MATCHING, FILL_BLANK_WORD_BANK).
  - **Flow:** List of activities → select one → complete activity → see result (score, feedback). After completion, **cognitive load** is inferred from score (e.g. low score → HIGH) and used to filter/suggest next activities (`suggestActivitiesByCognitiveLoad`).
  - **Activity types:** True/False, MCQ, Matching, Fill-in-the-Blank (word bank). Types and shapes are defined in `types/activities.ts` and aligned with `docs/PROMPT_ACTIVITIES_ENDPOINT.md`.

### 5.6 Library and Progress

- **Library** (`app/(tabs)/library.tsx`): Displays lessons with subject, duration, difficulty, and **sensory modes** (Visual, Audio, Haptic). Supports search and filters (All, subject, Saved); list/grid view.
- **Progress** (`app/(tabs)/progress.tsx`): Dashboard with weekly streak, subject progress, session time, and achievements (sample data). Intended to be backed by `/api/progress` when available.

### 5.7 Settings and Profile

- **Settings** (`features/settings/screens/SettingsScreen.tsx`): Includes toggles for **Haptic mode** and **Haptic intensity** (1–3), plus other app settings.
- **Edit Profile**: Update user profile; uses `updateUser` from AuthContext when applicable.

---

## 6. API Integration

### 6.1 Endpoints Used by the App

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Register |
| `/api/auth/login` | POST | Login |
| `/api/auth/logout` | POST | Logout |
| `/api/lessons` | POST | Create lesson |
| `/api/lessons/:id` | GET | Get lesson |
| `/api/lessons/:lessonId/activities` | GET | Activities for a lesson (optional filters) |
| `/api/activities` | GET | All activities (optional filters) |
| `/api/quizzes/generate` | POST | Generate quiz from lesson |
| `/api/quizzes/:id` | GET | Get quiz (student view) |
| `/api/quizzes/:id/submit` | POST | Submit answers + optional cognitive_load_features |
| `/api/quizzes/:id/results` | GET | Get results (score, cognitive_load, etc.) |

### 6.2 Configuration

- **Base URL:** `config/api.ts` — `getApiBaseUrl()` uses `Constants.expoConfig?.extra?.apiUrl` or platform-specific defaults (e.g. Android physical device IP for local testing).
- **Auth:** All requests that need auth attach the stored JWT via `apiRequest` in `services/api.ts`.

---

## 7. Research-Oriented Aspects

### 7.1 Multisensory Learning

- **Visual:** Lesson content and visuals in the Lesson Player; activity UIs in Concept Playground.
- **Audio:** Audio narration and toggles in Lesson Player; future TTS/audio from backend.
- **Haptic:** expo-haptics used for feedback (quiz correct/incorrect, tab presses, optional lesson haptics). Settings allow disabling or adjusting haptic intensity.

### 7.2 Cognitive Load

- **Measurement:** Quiz submission can include cognitive load features (response times, answer changes, errors, idle time, etc.) for backend analysis.
- **Prediction:** Backend may return `cognitive_load` (Low/Medium/High) and confidence/scores in quiz results; displayed on Quiz Result screen.
- **Adaptation:** Concept Playground infers cognitive load from activity score and suggests activities by cognitive load band to support adaptive practice.

### 7.3 Activity Model

- Activities are tagged with `cognitive_load` and `activity_type` and can be filtered by lesson (topic inferred by backend) or globally. Feedback messages (`all_correct`, `partial`, `low_score`, etc.) support learning and can be used in studies on feedback and load.

---

## 8. Theming and Accessibility

- **Theme** (`constants/theme.ts`): Central palette (e.g. deepBlue, teal, brightOrange) and light/dark semantic colors; typography (Poppins for headings, Inter for body). Supports dark/light via React Navigation theme.
- **Fonts:** Loaded in root layout (Inter, Poppins) and applied via Typography styles.

---

## 9. Backend and Future Work

- The **backend** is described in `BACKEND_PROPOSAL.md`: FastAPI, MongoDB/Beanie, auth, content processing pipeline (text analysis, concept extraction, visual/audio/haptic generation, quiz generation), and progress tracking.
- **ARCHITECTURE_DIAGRAM.md** describes the overall system flow: text input → analysis → parallel generation (visual, audio, haptics) → combination → quiz generation → user access.
- **Next steps** for the app may include: wiring Lesson Player to real lesson/concept data from the API, linking Library and Progress to backend, and expanding cognitive load features and analytics for research.

---

## 10. Document References

| Document | Description |
|----------|-------------|
| `README.md` | Expo setup and run instructions |
| `ARCHITECTURE_DIAGRAM.md` | System and data flow diagrams (Mermaid) |
| `BACKEND_PROPOSAL.md` | Backend stack, endpoints, ML pipeline, DB schema |
| `docs/PROMPT_ACTIVITIES_ENDPOINT.md` | Activities API specification for Concept Playground |
| `BACKEND_INTEGRATION.md` | Backend integration notes (if present) |

---

This document provides an introduction and detailed description of the EduSense React Native application as a research project. For implementation details, refer to the source code and the referenced architecture and API documents.
