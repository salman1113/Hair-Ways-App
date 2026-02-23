# 🐳 HairWays Docker Command Cheat Sheet

This master guide contains all the essential Terminal / Command Prompt instructions needed to manage the Hair Ways monorepo architecture.

## 🏗️ Architecture Overview
*   **`backend`**: Django Core API
*   **`ai_engine`**: FastAPI Computer Vision & LangChain RAG
*   **`db`**: PostgreSQL Database
*   **`api_gateway`**: Nginx Reverse Proxy
*   **Frontend**: React (runs locally via `npm run dev`)

---

## 🟢 1. Container Lifecycle Management

| Description | Command |
| :--- | :--- |
| **Start everything** (Detached mode) | `docker compose up -d` |
| **Stop everything** (Graceful shutdown) | `docker compose stop` |
| **Kill everything** (Force stop) | `docker compose kill` |
| **Bring down network** (Stops & removes containers) | `docker compose down` |
| **Bring down + wipe database & volumes** | `docker compose down -v` |

---

## 🔄 2. Rebuilding Containers

Use these commands when you modify `requirements.txt`, `Dockerfile`, or change major environment variables.

| Description | Command |
| :--- | :--- |
| **Rebuild & start ALL containers** | `docker compose up -d --build` |
| **Rebuild ONLY the Django backend** | `docker compose up -d --build backend` |
| **Rebuild ONLY the FastAPI AI engine** | `docker compose up -d --build ai_engine` |
| **Rebuild ONLY the Nginx API gateway** | `docker compose up -d --build api_gateway` |

---

## 🐛 3. Tailing & Viewing Logs

If something crashes, use these to see the console output of the containers in real-time.

| Description | Command |
| :--- | :--- |
| **View logs for ALL containers combined** | `docker compose logs -f` |
| **View logs for Django ONLY** | `docker compose logs -f backend` |
| **View logs for AI Engine ONLY** | `docker compose logs -f ai_engine` |
| **View logs for Nginx ONLY** | `docker compose logs -f api_gateway` |
| **View logs for Database ONLY** | `docker compose logs -f db` |

*(Tip: Press `Ctrl + C` to stop watching logs)*

---

## 🐍 4. Django & Database Operations

Commands executed *inside* the running Django container to manipulate the database.

| Description | Command |
| :--- | :--- |
| **Make Migrations** (After changing `models.py`) | `docker compose exec backend python manage.py makemigrations` |
| **Run Migrations** (Apply to PostgreSQL) | `docker compose exec backend python manage.py migrate` |
| **Create Superuser** (Admin login) | `docker compose exec backend python manage.py createsuperuser` |
| **Collect Static Files** | `docker compose exec backend python manage.py collectstatic --noinput` |

---

## 💻 5. Interactive Shell Access

Sometimes you need to dive into a container to explore the file system or run manual scripts.

| Description | Command |
| :--- | :--- |
| **Open Bash inside Django server** | `docker compose exec backend /bin/bash` |
| *(Alternative if bash fails)* | `docker compose exec backend /bin/sh` |
| **Open Bash inside AI engine** | `docker compose exec ai_engine /bin/bash` |
| **Open PostgreSQL shell (psql)** | `docker compose exec db psql -U postgres -d saloon_db` |
| **Open Django interactive Python shell** | `docker compose exec backend python manage.py shell` |

---

## 🧹 6. System Cleanup (Danger Zone)

Use these if your Docker environment gets deeply corrupted or if you run out of hard drive space.

| Description | Command |
| :--- | :--- |
| **Delete all unused/dangling images** | `docker image prune -a` |
| **Nuke everything** (Deletes all unused containers, networks, images, and volumes) | `docker system prune -a --volumes` |
