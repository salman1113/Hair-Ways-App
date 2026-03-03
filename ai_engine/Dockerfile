# ── Stage 1: Builder ──────────────────────────────────────────────────────
FROM python:3.11 AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# ── Stage 2: Production ──────────────────────────────────────────────────
FROM python:3.11-slim AS production

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# MediaPipe & OpenCV-ക്ക് വേണ്ട പ്രധാന ലൈബ്രറികൾ താഴെ പറയുന്നവയാണ് (Software Rendering Requirements)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libxcb1 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY . /app/
EXPOSE 8001

# Container health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/api/ai/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "2"]