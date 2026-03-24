from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import query

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
#   /ports/traffic
# ---------------------------
@app.get("/ports/traffic")
def traffic(top: int = 10, hours: int = 2):

    q = f'''
    SELECT count("value")
    FROM port_requests
    WHERE time > now() - {hours}h
    GROUP BY time(5m), port
    fill(0)
    '''

    result = query(q)

    # 🔍 DEBUG: ver qué devuelve Influx realmente
    print("DEBUG RESULT ITEMS:", list(result.items())[:3])

    data = []

    try:
        for (tags, points) in result.items():

            # 🔥 extracción correcta del puerto según tu Influx
            # tags = ('port_requests', {'port': '1007'})
            try:
                port = tags[1].get("port", "unknown")
            except:
                port = "unknown"

            serie = []
            total = 0

            for p in points:
                value = p.get("count", 0)

                serie.append({
                    "time": p.get("time"),
                    "value": value
                })

                total += value

            data.append({
                "port": port,
                "total": total,
                "data": serie
            })

    except Exception as e:
        print("ERROR en traffic:", e)
        return {"error": str(e)}

    # ordenar top N
    data = sorted(data, key=lambda x: x["total"], reverse=True)[:top]

    return data


# ---------------------------
#   /ports/top
# ---------------------------
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

    try:
        for (tags, points) in result.items():

            # misma estructura que en traffic()
            try:
                port = tags[1].get("port", "unknown")
            except:
                port = "unknown"

            data.append({
                "port": port,
                "count": points[0].get("count", 0)
            })

    except Exception as e:
        print("ERROR en top_ports:", e)
        return {"error": str(e)}

    return data


# ---------------------------
#   /ports/events
# ---------------------------
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

    try:
        for _, points in result.items():
            for p in points:
                data.append({
                    "ip": p.get("ip"),
                    "port": p.get("port"),
                    "time": p.get("time")
                })

    except Exception as e:
        print("ERROR en events:", e)
        return {"error": str(e)}

    return data
