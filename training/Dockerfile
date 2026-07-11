FROM python:3.10-slim

WORKDIR /app

# Install system dependencies that might be needed by OpenCV
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Set the default command to run the training script
ENTRYPOINT ["python", "train.py"]
