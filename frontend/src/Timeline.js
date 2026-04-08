import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from 'axios';

// Importación corregida para evitar errores de constructor
import { jsPDF } from 'jspdf'; 
import 'jspdf-autotable';

const COLORS = ['#00d2ff', '#4ade80', '#f87171', '#e879f9', '#fbbf24', '#22d3ee', '#818cf8', '#fb7185', '#a78bfa', '#2dd4bf'];

const selectStyle = {
  background: '#1c1c1f', 
  color: '#a1a1aa', 
  border: '1px solid #2d2d30',
  borderRadius: '6px', 
  padding: '5px 10px', 
  fontSize: '12px', 
  cursor: 'pointer',
  outline: 'none'
};

export default function Timeline({ onPortClick, selectedPort }) {
  const [data, setData] = useState([]);
  const [ports, setPorts] = useState([]);
  const [range, setRange] = useState('24h');
  const [group, setGroup] = useState('8000-8999'); // Default según tu tráfico activo
  const [limit, setLimit] = useState(10);

  // Función para descargar el reporte PDF
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("REPORTE DE TRÁFICO DE PUERTOS", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Rango: ${range} | Grupo: ${group} | Top: ${limit}`, 14, 30);
      doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 35);

      const tableRows = ports.map(p => [
        `Port ${p}`, 
        "Activo", 
        selectedPort === p ? "Filtrado" : "Global"
      ]);

      doc.autoTable({
        startY: 40,
        head: [['Puerto', 'Estado', 'Modo']],
        body: tableRows,
        headStyles: { fillColor: [0, 210, 255] }
      });

      doc.save(`reporte-forense-${range}.pdf`);
    } catch (err) {
      console.error("Error PDF:", err);
      alert("Error al generar el PDF. Verifica la consola.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/timeline`, { 
          params: { range, group, limit: parseInt(limit) } 
        });
        
        const timelineMap = {};
        const portList = Object.keys(res.data);
        setPorts(portList);

        portList.forEach(p => {
          res.data[p].forEach(pt => {
            const dateObj = new Date(pt.time);
            // Formato de hora dinámico según el rango
            const t = range.includes('d') 
              ? `${dateObj.getDate()}/${dateObj.getMonth()+1} ${dateObj.getHours()}:00`
              : `${dateObj.getHours()}:00`;

            if (!timelineMap[t]) timelineMap[t] = { time: t, rawTime: dateObj.getTime() };
            timelineMap[t][p] = pt.val;
          });
        });
        
        setData(Object.values(timelineMap).sort((a, b) => a.rawTime - b.rawTime));
      } catch (e) {
        console.error("Error fetching timeline:", e);
      }
    };
    fetchData();
  }, [range, group, limit]);

  return (
    <div style={{ background: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h3 style={{ fontSize: '13px', color: '#fff', margin: 0, fontWeight: '600' }}>PORT TRAFFIC HISTORY</h3>
          
          {/* BOTÓN VISIÓN GENERAL: Solo aparece si hay un puerto seleccionado */}
          {selectedPort && (
            <button 
              onClick={() => onPortClick(null)} 
              style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              VER TODOS LOS PUERTOS
            </button>
          )}
        </div>
        
        {/* SELECTORES DESPLEGABLES */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={generatePDF} style={{ ...selectStyle, background: '#27272a', color: '#fff' }}>PDF</button>
          
          <select style={selectStyle} value={limit} onChange={e => setLimit(e.target.value)}>
            <option value="10">Top 10</option>
            <option value="50">Top 50</option>
            <option value="100">Top 100</option>
            <option value="200">Top 200</option>
          </select>

          <select style={selectStyle} value={group} onChange={e => setGroup(e.target.value)}>
            <option value="0-1024">Puertos 0-1024</option>
            <option value="8000-8999">Puertos 8000-8999</option>
          </select>

          <select style={selectStyle} value={range} onChange={e => setRange(e.target.value)}>
            <option value="6h">6 horas</option>
            <option value="24h">24 horas</option>
            <option value="7d">7 días</option>
            <option value="30d">30 días</option>
          </select>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid stroke="#1f1f22" vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', color: '#fff' }} />
          {ports.map((p, i) => (
            <Line 
              key={p} 
              type="monotone" 
              dataKey={p} 
              stroke={COLORS[i % COLORS.length]} 
              strokeWidth={selectedPort === p ? 4 : 2}
              strokeOpacity={selectedPort && selectedPort !== p ? 0.1 : 1}
              dot={false} 
              connectNulls 
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* LEYENDA INTERACTIVA */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '20px', borderTop: '1px solid #1c1c1f', paddingTop: '15px' }}>
        {ports.map((p, i) => (
          <div 
            key={p} 
            onClick={() => onPortClick(p)} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
            <span style={{ fontSize: '12px', color: selectedPort === p ? '#fff' : '#a1a1aa', fontWeight: selectedPort === p ? '700' : '400' }}>
              Port {p}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
