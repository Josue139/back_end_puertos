import random
import requests
from datetime import datetime, timedelta

INFLUX_URL = "http://localhost:8086/write?db=ports"

start_time = datetime.now() - timedelta(hours=2)

for i in range(200000):

    current_time = start_time + timedelta(seconds=i)
    timestamp = int(current_time.timestamp() * 1e9)

    hot_ports = [80, 443, 22, 8080]

    if random.random() < 0.7:
        port = random.choice(hot_ports)
    else:
        port = random.choice(list(range(1,1025)) + list(range(8800,8900)))

    ip = ".".join(str(random.randint(1,255)) for _ in range(4))

    data = f"port_requests,port={port},ip={ip} value=1 {timestamp}"

    requests.post(INFLUX_URL, data=data)

print("Datos generados")
