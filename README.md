# 💇‍♂️ Hair Ways

An advanced AI-powered Salon & Business Management System built with a scalable microservices architecture. Hair Ways integrates a robust Django backend, a modern React frontend, and a dedicated FastAPI AI Engine featuring Computer Vision and LangChain RAG capabilities.

## 🚀 Features
- **AI-Driven Insights & Analysis:** Get smart insights on business statistics and user interactions via the dedicated AI Engine (LangChain, Groq, MediaPipe).
- **Core API & Real-time Communication:** Built with Django and Django REST Framework, utilizing Django Channels (`daphne`) and Redis for real-time WebSocket communication.
- **Background Tasks & Scheduling:** Asynchronous task processing (like appointment reminders) with Celery Worker and periodic jobs with Celery Beat.
- **Modern Web Interface:** A highly interactive, responsive frontend built with React, Vite, Tailwind CSS v4, and Recharts.
- **Scalable Deployment:** Fully containerized via Docker and ready for AWS ECS cloud deployment.

---

## 🏗️ Architecture & Services

The monorepo consists of several distinct services managed seamlessly by Docker Compose:

1.  **Backend Core (`backend_core`)**:
    - Central Django application handling authentication (JWT), user management, bookings, API endpoints, and websocket connections.
2.  **AI Engine (`ai_engine`)**:
    - Dedicated FastAPI service handling intensive AI tasks like Computer Vision (OpenCV, MediaPipe) and RAG generation (LangChain, SentenceTransformers, FAISS).
3.  **Frontend Web (`frontend_web`)**:
    - React 19 application running on Vite offering the main user and admin interfaces.
4.  **Database & Broker**:
    - PostgreSQL for relational data storage.
    - Redis for both WebSocket backing and Celery message brokering.
5.  **API Gateway (`api_gateway`)**:
    - Nginx reverse proxy managing external traffic and routing it seamlessly between the frontend, backend core, and AI engine services.
6.  **Background Workers (`celery_worker`, `celery_beat`)**:
    - Offloads heavy tasks such as email notifications and data polling from the main web server.

---

## 🛠️ Tech Stack

### Frontend
- **Frameworks:** React 19, Vite, React Router DOM
- **Styling & UI:** TailwindCSS v4, Framer Motion, Lucide React
- **Data Vis:** Recharts
- **Auth:** `@react-oauth/google`

### Backend Core
- **Framework:** Django 5.0, Django REST Framework
- **Async/Websockets:** Django Channels, Daphne
- **Tasks & Queue:** Celery, Redis
- **Database:** PostgreSQL (`psycopg2-binary`)

### AI Engine
- **Framework:** FastAPI, Uvicorn
- **AI/ML:** LangChain, Groq, HuggingFace, Faiss-CPU, OpenCV, MediaPipe
- **Data Validation:** Pydantic

### DevOps & Infrastructure
- **Containerization:** Docker, Docker Compose
- **Routing:** Nginx
- **Cloud/Deployment:** AWS ECS, ECR, S3 (django-storages)
- **CI/CD:** GitHub Actions

---

## 🏃‍♂️ Getting Started (Local Setup)

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/) installed
- Python (Optional, for running environments without Docker)
- Node.js (Optional, for local UI-only development)

### One-Command Setup
To spin up the entire multi-container architecture locally:

```bash
docker compose up -d --build
```
This single command spins up PostgreSQL, Redis, Django, FastAPI AI Engine, Celery Workers, and Nginx.

### Accessing the application
- **API Gateway (Nginx):** `http://localhost:80`
- **Django Core API:** `http://localhost:8000` (Locally exposed)
- **FastAPI AI Engine:** `http://localhost:8001` (Locally exposed)
- **Frontend App:** Navigate to `frontend_web/` and run `npm run dev`

> **Note:** For deep, comprehensive details on operating the Docker environment—including running bash inside containers, accessing database interfaces, rebuilding services, or tracking logs—please reference the 📖 [`CHEAT_SHEET.md`](./CHEAT_SHEET.md).

---

## ☁️ Deployment (AWS)

The project is structured for high availability deployment on AWS:
- **CI/CD pipeline:** Automated via GitHub Actions (`.github/workflows/deploy.yml`) to build and push images to AWS ECR.
- **Compute layer:** Hosted on AWS ECS (Elastic Container Service).
- **Storage:** Static/Media files are configured to be stored on AWS S3, accessed securely using custom bucket policies and CORS configurations.
