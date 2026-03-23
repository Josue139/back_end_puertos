from fastapi import FastAPI
from db import query

app = FastAPI()

# 🔹 tráfico por puerto (líneas)
@app.get("/ports/traffic")
def traffic(top: int = 10):

    q = f'''
    SELECT count("value")
    FROM port_requests
    WHERE time > now() - 2h
    GROUP BY time(5m), port
    '''

    result = query(q)

    data = []

    for (tags, points) in result.items():
        port = tags.get("port")

        serie = []
        total = 0

        for p in points:
            serie.append({
                "time": p["time"],
                "value": p["count"]
            })
            total += p["count"]

        data.append({
            "port": port,
            "total": total,
            "data": serie
        })

    # ordenar y limitar top N
    data = sorted(data, key=lambda x: x["total"], reverse=True)[:top]

    return data


# 🔹 top puertos
@app.get("/ports/top")
def top_ports(n: int = 50):

    q = f'''
    SELECT count("value")
    FROM port_requests
    WHERE time > now() - 2h
    GROUP BY port
    ORDER BY DESC
    LIMIT {n}
    '''

    result = query(q)

    data = []

    for (tags, points) in result.items():
        data.append({
            "port": tags.get("port"),
            "count": points[0]["count"]
        })

    return data


# 🔹 eventos recientes
@app.get("/ports/events")
def events(limit: int = 100):

    q = f'''
    SELECT ip, port
    FROM port_requests
    ORDER BY time DESC
    LIMIT {limit}
    '''

    result = query(q)

    data = []

    for _, points in result.items():
        for p in points:
            data.append(p)

    return data
