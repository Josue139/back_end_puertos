from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from influxdb import InfluxDBClient

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

client = InfluxDBClient(host='influxdb', port=8086, database='ports')

@app.get("/api/timeline")
def get_timeline(range: str = "24h", group: str = "all", limit: int = 10):
    # Intervalo inteligente para que el gráfico no se vea vacío
    interval = "1h"
    if "d" in range: interval = "6h"
    elif range == "2h": interval = "15m"

    p_filter = ""
    if group == "0-1024":
        p_filter = 'AND ("port" <= \'1024\' OR "port" <= 1024)'
    elif group == "8000-8999":
        p_filter = 'AND (("port" >= \'8000\' AND "port" <= \'8999\') OR ("port" >= 8000 AND "port" <= 8999))'

    try:
        # Buscamos el top de puertos para la leyenda
        q_top = f'SELECT SUM(value) FROM port_requests WHERE time > now() - {range} {p_filter} GROUP BY port'
        res_top = client.query(q_top)
        
        # Fallback: si el filtro no da nada, mostramos tráfico general
        if not res_top.items():
            q_top = f'SELECT SUM(value) FROM port_requests WHERE time > now() - {range} GROUP BY port'
            res_top = client.query(q_top)

        port_totals = sorted([(s[0][1].get('port', 'unk'), sum(p['sum'] for p in s[1] if p['sum'])) 
                             for s in res_top.items()], key=lambda x: x[1], reverse=True)
        top_ports = [p[0] for p in port_totals[:limit]]

        output = {}
        for port in top_ports:
            q = f'SELECT SUM(value) FROM port_requests WHERE time > now() - {range} AND "port" = \'{port}\' GROUP BY time({interval})'
            res = client.query(q)
            output[port] = [{"time": p['time'], "val": p['sum'] or 0} for p in list(res.get_points())]
        return output
    except:
        return {}

@app.get("/api/top-ips")
def get_top_ips(port: str = None):
    # Provee datos para la tabla y la columna "Last Activity"
    where = 'WHERE time > now() - 24h'
    if port and port != "null":
        where += f' AND "port" = \'{port}\''
    
    try:
        query = f'SELECT SUM(value), LAST(value) FROM port_requests {where} GROUP BY ip, port'
        result = client.query(query)
        ips_data = []
        for series in result.items():
            points = list(series[1])
            ips_data.append({
                "ip": series[0][1].get('ip', 'N/A'),
                "port": series[0][1].get('port', 'N/A'),
                "count": sum(p['sum'] for p in points if p['sum']),
                "last_activity": points[-1]['time'] if points else None
            })
        return sorted(ips_data, key=lambda x: x['count'], reverse=True)[:15]
    except:
        return []
