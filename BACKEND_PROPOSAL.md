# EduSense Backend Architecture Proposal

## Overview

This document outlines the proposed backend architecture for the EduSense mobile application - a sensory learning platform that transforms educational content into multi-sensory experiences.

## Directory Structure

```
edusense-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration settings
│   ├── database.py             # Database connection & setup
│   │
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── users.py           # User management
│   │   ├── lessons.py         # Lesson CRUD operations
│   │   ├── content.py         # Content processing endpoints
│   │   ├── quizzes.py         # Quiz generation & results
│   │   ├── progress.py        # Progress tracking
│   │   └── uploads.py         # File upload handling
│   │
│   ├── models/                 # Database models (Beanie ODM)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── lesson.py
│   │   ├── quiz.py
│   │   ├── progress.py
│   │   └── content.py
│   │
│   ├── schemas/                # Pydantic schemas (request/response)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── lesson.py
│   │   ├── quiz.py
│   │   └── content.py
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── lesson_service.py
│   │   ├── content_processor.py  # Main content processing orchestrator
│   │   └── quiz_generator.py
│   │
│   ├── ml/                     # Machine Learning components
│   │   ├── __init__.py
│   │   ├── models/            # Trained model files (.pkl, .h5, .pt, etc.)
│   │   │   ├── concept_extractor.pkl
│   │   │   ├── quiz_generator.pkl
│   │   │   ├── audio_generator.pkl
│   │   │   └── haptic_designer.pkl
│   │   ├── processors/        # ML processing modules
│   │   │   ├── __init__.py
│   │   │   ├── text_analyzer.py      # NLP for content analysis
│   │   │   ├── concept_extractor.py  # Extract key concepts
│   │   │   ├── visual_generator.py   # Generate visual descriptions
│   │   │   ├── audio_generator.py    # Generate audio scripts
│   │   │   ├── haptic_designer.py    # Design haptic patterns
│   │   │   └── quiz_generator.py     # Generate quiz questions
│   │   └── utils.py           # ML utilities
│   │
│   ├── storage/                # File storage handling
│   │   ├── __init__.py
│   │   ├── local_storage.py   # Local file storage
│   │   └── cloud_storage.py   # Cloud storage (S3, etc.)
│   │
│   └── utils/                  # Utility functions
│       ├── __init__.py
│       ├── security.py        # Password hashing, JWT tokens
│       ├── validators.py      # Input validation
│       └── helpers.py         # General helpers
│
├── tests/                      # Test files
│   ├── __init__.py
│   ├── test_api/
│   ├── test_services/
│   └── test_ml/
│
├── scripts/                    # Utility scripts
│   ├── train_models.py        # Script to train ML models
│   ├── seed_data.py           # Seed database with initial data
│   └── deploy.py              # Deployment script
│
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
├── .gitignore
├── README.md
└── docker-compose.yml         # For local development with DB

```

## Technology Stack

### Core Framework

- **FastAPI**: Modern, fast Python web framework with automatic API documentation
- **Python 3.10+**: Latest Python features

### Database

- **MongoDB**: NoSQL document database for flexible schema
- **Beanie**: Async ODM (Object Document Mapper) for MongoDB
- **Motor**: Async MongoDB driver (used by Beanie)

**Why MongoDB?**

- **Flexible Schema**: Educational content can have varying structures (different lesson types, nested concepts)
- **Nested Documents**: Perfect for storing lessons with embedded concepts, questions, and metadata
- **JSON-like Structure**: Natural fit for API responses and mobile app data
- **Scalability**: Easy to scale horizontally as content grows
- **Async Support**: Beanie provides excellent async/await support for FastAPI

### Authentication & Security

- **JWT (python-jose)**: Token-based authentication
- **bcrypt**: Password hashing
- **python-multipart**: File upload support

### Machine Learning

- **scikit-learn**: Traditional ML models
- **transformers** (Hugging Face): Pre-trained NLP models
- **numpy/pandas**: Data processing
- **torch/tensorflow**: Deep learning (if needed)

### File Storage

- **Local storage**: For development
- **AWS S3 / Cloud Storage**: For production

### Other Libraries

- **Pydantic**: Data validation
- **python-dotenv**: Environment variables
- **uvicorn**: ASGI server
- **beanie**: Async ODM for MongoDB (built on Motor)

## Key Features & Endpoints

### 1. Authentication (`/api/auth`)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### 2. Lessons (`/api/lessons`)

- `GET /api/lessons` - List user's lessons
- `POST /api/lessons` - Create new lesson
- `GET /api/lessons/{id}` - Get lesson details
- `PUT /api/lessons/{id}` - Update lesson
- `DELETE /api/lessons/{id}` - Delete lesson

### 3. Content Processing (`/api/content`)

- `POST /api/content/process` - Process text content
  - Input: Text, subject, user preferences
  - Output: Processed lesson with concepts, visuals, audio, haptics
- `GET /api/content/status/{job_id}` - Check processing status
- `POST /api/content/regenerate` - Regenerate specific components

### 4. Quizzes (`/api/quizzes`)

- `POST /api/quizzes/generate` - Generate quiz from lesson
- `GET /api/quizzes/{id}` - Get quiz details
- `POST /api/quizzes/{id}/submit` - Submit quiz answers
- `GET /api/quizzes/{id}/results` - Get quiz results

### 5. Progress (`/api/progress`)

- `GET /api/progress` - Get user progress summary
- `GET /api/progress/lessons/{lesson_id}` - Get lesson progress
- `POST /api/progress/update` - Update progress

### 6. File Uploads (`/api/uploads`)

- `POST /api/uploads/video` - Upload video file
- `POST /api/uploads/image` - Upload image file
- `GET /api/uploads/{file_id}` - Get file URL

## ML Processing Pipeline

### Content Processing Flow:

1. **Text Analysis** → Extract structure, identify topics
2. **Concept Extraction** → Identify key learning concepts
3. **Visual Generation** → Generate visual descriptions/scenes
4. **Audio Generation** → Create narration scripts
5. **Haptic Design** → Design haptic feedback patterns
6. **Quiz Generation** → Create assessment questions

### ML Models Needed:

1. **Concept Extractor**: NLP model to extract key concepts from text
2. **Quiz Generator**: Generate questions from content
3. **Audio Script Generator**: Create natural narration
4. **Haptic Pattern Designer**: Design vibration patterns
5. **Visual Scene Generator**: Describe visual elements

## Database Schema (MongoDB Collections)

### Collections Structure:

- **users**: User accounts

  ```json
  {
    "_id": ObjectId,
    "email": string,
    "username": string,
    "hashed_password": string,
    "created_at": datetime,
    "profile": {
      "name": string,
      "avatar": string
    }
  }
  ```

- **lessons**: Lesson documents with nested concepts

  ```json
  {
    "_id": ObjectId,
    "user_id": ObjectId,
    "title": string,
    "subject": string,
    "content": string,
    "concepts": [
      {
        "id": string,
        "title": string,
        "description": string,
        "audio_script": string,
        "haptics_pattern": object
      }
    ],
    "visuals": array,
    "created_at": datetime,
    "progress": number
  }
  ```

- **quizzes**: Quiz documents with nested questions

  ```json
  {
    "_id": ObjectId,
    "lesson_id": ObjectId,
    "user_id": ObjectId,
    "questions": [
      {
        "id": string,
        "type": "multiple" | "truefalse",
        "question": string,
        "options": array,
        "correct_index": number
      }
    ],
    "created_at": datetime
  }
  ```

- **quiz_results**: User quiz results

  ```json
  {
    "_id": ObjectId,
    "quiz_id": ObjectId,
    "user_id": ObjectId,
    "answers": array,
    "score": number,
    "completed_at": datetime
  }
  ```

- **progress**: User progress tracking

  ```json
  {
    "_id": ObjectId,
    "user_id": ObjectId,
    "lesson_id": ObjectId,
    "progress_percent": number,
    "last_accessed": datetime,
    "completed_concepts": array
  }
  ```

- **content_files**: Uploaded files metadata

  ```json
  {
    "_id": ObjectId,
    "user_id": ObjectId,
    "file_type": "video" | "image",
    "file_path": string,
    "file_url": string,
    "uploaded_at": datetime
  }
  ```

- **processing_jobs**: Async processing job tracking
  ```json
  {
    "_id": ObjectId,
    "user_id": ObjectId,
    "lesson_id": ObjectId,
    "status": "pending" | "processing" | "completed" | "failed",
    "stage": string,
    "created_at": datetime,
    "completed_at": datetime
  }
  ```

## Security Considerations

- JWT token-based authentication
- Password hashing with bcrypt
- CORS configuration for mobile app
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure file upload handling

## Deployment

- **Development**: Local MongoDB instance
- **Production**: MongoDB Atlas (cloud) or self-hosted MongoDB
- **ML Models**: Stored in `ml/models/` directory or cloud storage
- **File Storage**: Local for dev, S3 for production
- **Docker**: Docker Compose for local MongoDB + FastAPI setup

## Next Steps

1. Set up project structure
2. Initialize FastAPI application
3. Set up database models
4. Implement authentication
5. Create content processing pipeline
6. Integrate ML models
7. Add file upload handling
8. Implement quiz generation
9. Add progress tracking

---

**Recommendation**: Start with `edusense-backend` as the directory name to clearly identify it as the backend service for the EduSense mobile app.
