# Base stage for common dependencies
FROM python:3.11-slim as python-base
WORKDIR /app
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app

# Frontend build stage
FROM node:18-alpine as frontend-build
WORKDIR /frontend
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ .
RUN npm run build

# Backend dependencies stage
FROM python-base as backend-deps
COPY Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Testing stage
FROM python-base as test
WORKDIR /app
COPY Backend/requirements.txt ./backend-requirements.txt
COPY Testing/requirements.txt ./test-requirements.txt
RUN pip install --no-cache-dir -r backend-requirements.txt -r test-requirements.txt

# Copy backend and test code
COPY Backend/ backend/
COPY Testing/ testing/

# Run tests
CMD ["pytest", "testing/"]

# Final stage
FROM python-base as final
WORKDIR /app

# Copy backend dependencies and code
COPY --from=backend-deps /usr/local/lib/python3.11/site-packages/ /usr/local/lib/python3.11/site-packages/
COPY Backend/ backend/

# Copy frontend build
COPY --from=frontend-build /frontend/build frontend/build/

# Copy necessary scripts and configurations
COPY scripts/ scripts/
COPY configs/ configs/

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["python", "backend/main.py"] 