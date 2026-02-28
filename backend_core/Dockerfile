# ═══════════════════════════════════════════════════════════════════════════
#  Hair Ways – Django Backend  (Multi-Stage Build for AWS ECR / ECS Fargate)
# ═══════════════════════════════════════════════════════════════════════════

# ── Stage 1: Builder ──────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install build-only system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a virtual environment so we can copy it cleanly to production
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies into the venv
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt


# ── Stage 2: Production ──────────────────────────────────────────────────
FROM python:3.11-slim AS production

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install only runtime system libraries (no gcc, no build tools)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    libjpeg62-turbo \
    zlib1g \
    && rm -rf /var/lib/apt/lists/*

# Copy the pre-built virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy the project source code
COPY . .

# Collect static files (will go to S3 in prod via collectstatic)
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Container-level health check (ECS also uses the ALB /health/ endpoint)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health/')" || exit 1

# ── Default CMD: Daphne (ASGI with WebSocket support) ────────────────────
# To switch to Gunicorn (multi-worker):
#   CMD ["gunicorn", "saloon_core.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "-c", "gunicorn_config.py"]
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "saloon_core.asgi:application"]
