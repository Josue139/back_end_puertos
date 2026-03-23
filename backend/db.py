from influxdb import InfluxDBClient

client = InfluxDBClient(host='localhost', port=8086)
client.switch_database('ports')

def query(q):
    return client.query(q)
