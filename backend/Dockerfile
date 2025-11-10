# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Use Aliyun mirror for apt (faster in China)
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources

# Use pip mirror for faster downloads in China
RUN pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Configure IPv4 preference over IPv6
RUN echo "precedence ::ffff:0:0/96  100" >> /etc/gai.conf

# Copy requirements (use full requirements.txt)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install additional dependencies for auth
RUN pip install --no-cache-dir bcrypt pyjwt email-validator

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
