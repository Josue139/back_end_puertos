import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function PortTable() {
  const [ips, setIps] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/top-ips").then(res => setIps(res.data));
  }, []);

  return (
    <div className="card">
      <h3>Top IPs by Port Access</h3>
      <table>
        <thead>
          <tr>
            <th>Origin IP</th>
            <th>Port</th>
            <th>Requests</th>
          </tr>
        </thead>
        <tbody>
          {ips.map((row, i) => (
            <tr key={i}>
              <td>{row.ip}</td>
              <td className="port-tag">{row.port}</td>
              <td>{row.count.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
