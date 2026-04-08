import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function PortTable({ filterPort }) {
  const [ips, setIps] = useState([]);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "N/A";
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  useEffect(() => {
    const fetchIps = async () => {
      const res = await axios.get(`http://localhost:8000/api/top-ips`, { params: { port: filterPort } });
      setIps(res.data);
    };
    fetchIps();
  }, [filterPort]);

  return (
    <div style={{ background: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '24px', marginTop: '25px' }}>
      <h3 style={{ fontSize: '12px', color: '#fff', marginBottom: '20px', fontWeight: '600' }}>TOP IPS BY PORT ACCESS</h3>
      <table style={{ width: '100%', color: '#a1a1aa', fontSize: '12px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #1c1c1f', color: '#71717a' }}>
            <th style={{ padding: '12px' }}>ORIGIN IP</th>
            <th style={{ padding: '12px' }}>PORT</th>
            <th style={{ padding: '12px' }}>TOTAL REQUESTS</th>
            <th style={{ padding: '12px' }}>LAST ACTIVITY</th>
          </tr>
        </thead>
        <tbody>
          {ips.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #1c1c1f' }}>
              <td style={{ padding: '12px', color: '#fff' }}>{item.ip}</td>
              <td style={{ padding: '12px', color: '#00d2ff' }}>{item.port}</td>
              <td style={{ padding: '12px', fontWeight: '700', color: '#fff' }}>{item.count}</td>
              <td style={{ padding: '12px' }}>{formatTimeAgo(item.last_activity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
