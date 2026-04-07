import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from influxdb import InfluxDBClient
import uvicorn

app = FastAPI()

# --- CONFIGURACIÓN DE CORS (Crucial para Docker y Navegador) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexión a InfluxDB 1.8
# Usamos la variable de entorno 'INFLUX_HOST' que viene del docker-compose (valor: influxdb)
INFLUX_HOST = os.getenv("INFLUX_HOST", "influxdb")
client = InfluxDBClient(host=INFLUX_HOST, port=8086, database='ports')

@app.get("/api/timeline")
def get_timeline():
    """
    Obtiene el histórico de tráfico agrupado por hora y puerto para el gráfico de líneas.
    """
    try:
        q = 'SELECT SUM(value) FROM port_requests WHERE time > now() - 24h GROUP BY time(1h), port'
        res = client.query(q)
        output = {}
        
        for series in res.items():
            # series[0][1] contiene los tags, extraemos el número de puerto
            port = series[0][1].get('port', 'unknown')
            points = list(series[1])
            
            formatted_points = []
            for p in points:
                # Lógica dinámica: Buscamos cualquier campo que no sea 'time' y tenga valor
                # Esto evita errores si InfluxDB cambia 'sum' por 'sum_value'
                val = 0
                for key, value in p.items():
                    if key != 'time' and value is not None:
                        val = value
                        break
                
                formatted_points.append({
                    "time": p['time'], 
                    "val": val
                })
            output[port] = formatted_points
        return output
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/top-ips")
def get_top_ips():
    """
    Obtiene el ranking de IPs y a qué puertos están accediendo para la tabla.
    """
    try:
        q = 'SELECT SUM(value) FROM port_requests WHERE time > now() - 6h GROUP BY ip, port'
        res = client.query(q)
        data = []
        
        for series in res.items():
            ip_addr = series[0][1].get('ip', 'Anónima')
            port_id = series[0][1].get('port', 'Desconocido')
            points = list(series[1])
            
            if points:
                # Buscamos el valor de la suma dinámicamente
                total_val = 0
                for key, value in points[0].items():
                    if key != 'time' and value is not None:
                        total_val = value
                        break
                
                data.append({
                    "ip": ip_addr,
                    "port": port_id,
                    "count": total_val
                })
        
        # Ordenamos por cantidad de solicitudes (descendente)
        return sorted(data, key=lambda x: x['count'], reverse=True)[:15]
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    # Importante: host="0.0.0.0" para que sea accesible desde fuera del contenedor
    uvicorn.run(app, host="0.0.0.0", port=8000)
