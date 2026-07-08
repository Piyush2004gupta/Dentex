FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip uninstall -y opencv-python opencv-python-headless && \
    pip install --no-cache-dir "opencv-python-headless<4.10"
COPY . .
EXPOSE 8080
CMD ["uvicorn","main:app","--host","0.0.0.0","--port","8080"]