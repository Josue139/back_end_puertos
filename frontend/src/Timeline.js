import React, { useEffect, useState } from 'react'; // <-- ESTA LÍNEA ES LA CLAVE
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import axios from 'axios';

const COLORS = ['#00bfff', '#32cd32', '#ff4500', '#da70d6', '#ff1493', '#ffd700'];

export default function Timeline() {
  const [data, setData] = useState([]);
  const [ports, setPorts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/timeline")
      .then(res => {
        const keys = Object.keys(res.data);
        setPorts(keys);
        
        const timelineMap = {};
        keys.forEach(p => {
          res.data[p].forEach(pt => {
            const date = new Date(pt.time);
            const t = date.getHours().toString().padStart(2, '0') + ":00";
            
            if(!timelineMap[t]) timelineMap[t] = { time: t };
            timelineMap[t][p] = Number(pt.val);
          });
        });
        
        const sortedData = Object.values(timelineMap).sort((a, b) => a.time.localeCompare(b.time));
        setData(sortedData);
      })
      .catch(err => console.error("Error en Timeline:", err));
  }, []);

  return (
    <div className="card" style={{ background: '#18181b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a' }}>
      <h3 style={{ color: '#fff', marginBottom: '20px' }}>Port Traffic History (24h)</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          <XAxis dataKey="time" stroke="#71717a" fontSize={12} tickLine={false} />
          <YAxis stroke="#71717a" fontSize={12} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', color: '#fff' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend />
          {ports.map((p, i) => (
            <Line 
              key={p} 
              type="monotone" 
              dataKey={p} 
              stroke={COLORS[i % COLORS.length]} 
              dot={false} 
              strokeWidth={2} 
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
