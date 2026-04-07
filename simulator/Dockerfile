FROM python:3.9-slim

WORKDIR /app

# Solo necesita requests para enviar datos a InfluxDB
RUN pip install --no-cache-dir requests

COPY . .

# El simulador no expone puertos, solo envía datos
CMD ["python", "traffic_simulator.py"]
