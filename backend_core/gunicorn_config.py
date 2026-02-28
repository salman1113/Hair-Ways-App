"""
Gunicorn configuration for Hair Ways Django Backend.

Usage (alternative to Daphne):
    gunicorn saloon_core.asgi:application -k uvicorn.workers.UvicornWorker -c gunicorn_config.py
"""

import multiprocessing

# ── Server Socket ─────────────────────────────────────────────────────────
bind = "0.0.0.0:8000"

# ── Worker Processes ──────────────────────────────────────────────────────
# ECS Fargate: 1 vCPU ≈ 2 workers, 2 vCPU ≈ 5 workers
workers = multiprocessing.cpu_count() * 2 + 1

# ASGI worker class (required for WebSocket / Channels support)
worker_class = "uvicorn.workers.UvicornWorker"

# ── Timeouts ──────────────────────────────────────────────────────────────
timeout = 120           # Kill workers silent for >120s
graceful_timeout = 30   # Time to finish requests on restart
keepalive = 5           # Keep connections alive for 5s

# ── Logging ───────────────────────────────────────────────────────────────
accesslog = "-"         # STDOUT → CloudWatch
errorlog = "-"          # STDOUT → CloudWatch
loglevel = "info"

# ── Process Naming ────────────────────────────────────────────────────────
proc_name = "hairways-backend"
