import time
import random
import requests

# URL interna de Docker
URL = "http://influxdb:8086/write?db=ports"

def simulate():
    while True:
        # Rango 0-1024 y 8000-8999
        port = random.choice([22, 80, 443, 8080] + list(range(8000, 8010)))
        ip = f"192.168.1.{random.randint(1, 254)}"
        val = random.randint(10, 500)
        line = f"port_requests,port={port},ip={ip} value={val}"
        try:
            requests.post(URL, data=line)
        except:
            pass
        time.sleep(1)

if __name__ == "__main__":
    simulate()
