FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY /requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ .  

EXPOSE 5000

CMD ["python", "run.py"]